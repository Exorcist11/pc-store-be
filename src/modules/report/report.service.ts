import { Injectable } from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import { Order, OrderDocument } from '../orders/schema/order.schema';
import { Model } from 'mongoose';

@Injectable()
export class ReportService {
  constructor(
    @InjectModel(Order.name)
    private readonly orderModel: Model<OrderDocument>,
  ) {}

  private getDateFilter(startDate?: string, endDate?: string) {
    const filter: any = {};
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }
    return filter;
  }

  // Tổng quan doanh thu
  async getRevenueOverview(startDate?: string, endDate?: string) {
    const filter = this.getDateFilter(startDate, endDate);

    const [stats, previousPeriodStats] = await Promise.all([
      this.orderModel.aggregate([
        { $match: { ...filter, paymentStatus: 'paid' } },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$total' },
            totalOrders: { $sum: 1 },
            averageOrderValue: { $avg: '$total' },
          },
        },
      ]),
      this.getPreviousPeriodStats(startDate, endDate),
    ]);

    const current = stats[0] || {
      totalRevenue: 0,
      totalOrders: 0,
      averageOrderValue: 0,
    };

    return {
      totalRevenue: current.totalRevenue,
      totalOrders: current.totalOrders,
      averageOrderValue: current.averageOrderValue,
      growth: {
        revenue:
          previousPeriodStats.totalRevenue > 0
            ? ((current.totalRevenue - previousPeriodStats.totalRevenue) /
                previousPeriodStats.totalRevenue) *
              100
            : 0,
        orders:
          previousPeriodStats.totalOrders > 0
            ? ((current.totalOrders - previousPeriodStats.totalOrders) /
                previousPeriodStats.totalOrders) *
              100
            : 0,
      },
    };
  }

  private async getPreviousPeriodStats(startDate?: string, endDate?: string) {
    if (!startDate || !endDate) {
      return { totalRevenue: 0, totalOrders: 0 };
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const diff = end.getTime() - start.getTime();

    const prevStart = new Date(start.getTime() - diff);
    const prevEnd = new Date(start.getTime());

    const stats = await this.orderModel.aggregate([
      {
        $match: {
          createdAt: { $gte: prevStart, $lte: prevEnd },
          paymentStatus: 'paid',
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$total' },
          totalOrders: { $sum: 1 },
        },
      },
    ]);

    return stats[0] || { totalRevenue: 0, totalOrders: 0 };
  }

  // Doanh thu theo thời gian
  async getRevenueByPeriod(
    period: 'day' | 'week' | 'month',
    startDate?: string,
    endDate?: string,
  ) {
    const filter = this.getDateFilterPeriod(startDate, endDate);

    // Định nghĩa cách group theo period
    const groupByFormat: any = {
      day: {
        year: { $year: '$createdAt' },
        month: { $month: '$createdAt' },
        day: { $dayOfMonth: '$createdAt' },
      },
      week: {
        year: { $year: '$createdAt' },
        week: { $week: '$createdAt' }, // MongoDB tự tính tuần
      },
      month: {
        year: { $year: '$createdAt' },
        month: { $month: '$createdAt' },
      },
    };

    // Aggregate doanh thu
    const rawData = await this.orderModel.aggregate([
      { $match: { ...filter, paymentStatus: 'paid' } },
      {
        $group: {
          _id: groupByFormat[period],
          revenue: { $sum: '$total' },
          orders: { $sum: 1 },
          averageOrderValue: { $avg: '$total' },
        },
      },
      ...(period === 'day'
        ? [
            {
              $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } as Record<
                string,
                1 | -1
              >,
            },
          ]
        : period === 'week'
          ? [
              {
                $sort: { '_id.year': 1, '_id.week': 1 } as Record<
                  string,
                  1 | -1
                >,
              },
            ]
          : [
              {
                $sort: { '_id.year': 1, '_id.month': 1 } as Record<
                  string,
                  1 | -1
                >,
              },
            ]),
    ]);

    // Chuyển rawData sang map để dễ fill ngày/tuần/tháng không có đơn hàng
    const dataMap = new Map<string, any>();
    for (const item of rawData) {
      const key = this.getPeriodKey(item._id, period);
      dataMap.set(key, {
        period: item._id,
        revenue: item.revenue,
        orders: item.orders,
        averageOrderValue: item.averageOrderValue,
      });
    }

    // Tạo danh sách tất cả period trong khoảng
    const allPeriods = this.generateAllPeriods(period, startDate, endDate);

    // Fill dữ liệu, nếu không có thì revenue = 0
    const result = allPeriods.map(
      (p) =>
        dataMap.get(p) || {
          ...this.parsePeriodKey(p, period),
          revenue: 0,
          orders: 0,
          averageOrderValue: 0,
        },
    );

    return result;
  }

  // Lọc theo khoảng ngày
  private getDateFilterPeriod(startDate?: string, endDate?: string) {
    const filter: any = {};
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }
    return filter;
  }

  // Tạo key dạng string cho map
  private getPeriodKey(periodObj: any, period: 'day' | 'week' | 'month') {
    if (period === 'day')
      return `${periodObj.year}-${periodObj.month}-${periodObj.day}`;
    if (period === 'week') return `${periodObj.year}-W${periodObj.week}`;
    return `${periodObj.year}-${periodObj.month}`;
  }

  // Chuyển string key thành object period
  private parsePeriodKey(key: string, period: 'day' | 'week' | 'month') {
    if (period === 'day') {
      const [year, month, day] = key.split('-').map(Number);
      return { year, month, day };
    }
    if (period === 'week') {
      const [year, weekStr] = key.split('-W');
      return { year: Number(year), week: Number(weekStr) };
    }
    const [year, month] = key.split('-').map(Number);
    return { year, month };
  }

  // Sinh tất cả period trong khoảng
  private generateAllPeriods(
    period: 'day' | 'week' | 'month',
    start?: string,
    end?: string,
  ) {
    const result: string[] = [];
    const startDate = start ? new Date(start) : new Date();
    const endDate = end ? new Date(end) : new Date();

    const current = new Date(startDate);
    while (current <= endDate) {
      let key = '';
      if (period === 'day') {
        key = `${current.getFullYear()}-${current.getMonth() + 1}-${current.getDate()}`;
        result.push(key);
        current.setDate(current.getDate() + 1);
      } else if (period === 'week') {
        const week = this.getWeekNumber(current);
        key = `${current.getFullYear()}-W${week}`;
        if (!result.includes(key)) result.push(key);
        current.setDate(current.getDate() + 1);
      } else {
        key = `${current.getFullYear()}-${current.getMonth() + 1}`;
        if (!result.includes(key)) result.push(key);
        current.setMonth(current.getMonth() + 1);
      }
    }

    return result;
  }

  // Lấy số tuần trong năm (ISO week)
  private getWeekNumber(d: Date) {
    const date = new Date(d.getTime());
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + 4 - (date.getDay() || 7));
    const yearStart = new Date(date.getFullYear(), 0, 1);
    const weekNo = Math.ceil(
      ((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7,
    );
    return weekNo;
  }

  // Top sản phẩm bán chạy
  async getTopProducts(limit: number, startDate?: string, endDate?: string) {
    const filter = this.getDateFilter(startDate, endDate);

    const data = await this.orderModel.aggregate([
      { $match: filter },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: {
            $sum: { $multiply: ['$items.quantity', '$items.price'] },
          },
          orderCount: { $sum: 1 },
        },
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product',
        },
      },
      { $unwind: '$product' },
    ]);

    return data.map((item) => ({
      productId: item._id,
      productName: item.product.name,
      totalQuantity: item.totalQuantity,
      totalRevenue: item.totalRevenue,
      orderCount: item.orderCount,
    }));
  }

  // Thống kê trạng thái đơn hàng
  async getOrderStatusStats(startDate?: string, endDate?: string) {
    const filter = this.getDateFilter(startDate, endDate);

    const data = await this.orderModel.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalValue: { $sum: '$total' },
        },
      },
    ]);

    return data.map((item) => ({
      status: item._id,
      count: item.count,
      totalValue: item.totalValue,
    }));
  }

  // Thống kê phương thức thanh toán
  async getPaymentMethodStats(startDate?: string, endDate?: string) {
    const filter = this.getDateFilter(startDate, endDate);

    const data = await this.orderModel.aggregate([
      { $match: { ...filter, paymentStatus: 'paid' } },
      {
        $group: {
          _id: '$paymentMethod',
          count: { $sum: 1 },
          totalValue: { $sum: '$total' },
        },
      },
    ]);

    return data.map((item) => ({
      paymentMethod: item._id,
      count: item.count,
      totalValue: item.totalValue,
      percentage: 0, // Sẽ tính sau
    }));
  }

  // Thống kê khách hàng
  async getCustomerStats(startDate?: string, endDate?: string) {
    const filter = this.getDateFilter(startDate, endDate);

    const [guestOrders, registeredOrders, repeatCustomers] = await Promise.all([
      this.orderModel.countDocuments({ ...filter, isGuest: true }),
      this.orderModel.countDocuments({ ...filter, isGuest: false }),
      this.orderModel.aggregate([
        { $match: { ...filter, isGuest: false } },
        { $group: { _id: '$user', orderCount: { $sum: 1 } } },
        { $match: { orderCount: { $gt: 1 } } },
        { $count: 'repeatCustomers' },
      ]),
    ]);

    return {
      guestOrders,
      registeredOrders,
      repeatCustomers: repeatCustomers[0]?.repeatCustomers || 0,
      totalCustomers: guestOrders + registeredOrders,
    };
  }

  // Tỷ lệ chuyển đổi
  async getConversionRate(startDate?: string, endDate?: string) {
    const filter = this.getDateFilter(startDate, endDate);

    const [completed, cancelled] = await Promise.all([
      this.orderModel.countDocuments({
        ...filter,
        status: { $in: ['delivered', 'shipped'] },
      }),
      this.orderModel.countDocuments({ ...filter, status: 'cancelled' }),
    ]);

    const total = completed + cancelled;
    return {
      completed,
      cancelled,
      total,
      conversionRate: total > 0 ? (completed / total) * 100 : 0,
    };
  }

  // Giá trị đơn hàng trung bình
  async getAverageOrderValue(startDate?: string, endDate?: string) {
    const filter = this.getDateFilter(startDate, endDate);

    const result = await this.orderModel.aggregate([
      { $match: { ...filter, paymentStatus: 'paid' } },
      {
        $group: {
          _id: null,
          averageValue: { $avg: '$total' },
          minValue: { $min: '$total' },
          maxValue: { $max: '$total' },
        },
      },
    ]);

    return result[0] || { averageValue: 0, minValue: 0, maxValue: 0 };
  }

  // Thống kê theo địa điểm
  async getSalesByLocation(startDate?: string, endDate?: string) {
    const filter = this.getDateFilter(startDate, endDate);

    const data = await this.orderModel.aggregate([
      { $match: { ...filter, paymentStatus: 'paid' } },
      {
        $group: {
          _id: {
            country: '$shippingAddress.country',
            city: '$shippingAddress.city',
          },
          orderCount: { $sum: 1 },
          totalRevenue: { $sum: '$total' },
        },
      },
      { $sort: { totalRevenue: -1 } },
    ]);

    return data.map((item) => ({
      country: item._id.country,
      city: item._id.city,
      orderCount: item.orderCount,
      totalRevenue: item.totalRevenue,
    }));
  }

  // Báo cáo chi tiết
  async getDetailedOrders(
    page: number,
    limit: number,
    status?: string,
    paymentStatus?: string,
    startDate?: string,
    endDate?: string,
  ) {
    const filter: any = this.getDateFilter(startDate, endDate);
    if (status) filter.status = status;
    if (paymentStatus) filter.paymentStatus = paymentStatus;

    const [orders, total] = await Promise.all([
      this.orderModel
        .find(filter)
        .populate('user', 'email firstName lastName')
        .populate('items.product', 'name')
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ createdAt: -1 })
        .lean(),
      this.orderModel.countDocuments(filter),
    ]);

    return {
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Export báo cáo
  async exportReport(
    type: 'orders' | 'revenue' | 'products',
    startDate?: string,
    endDate?: string,
  ) {
    // Implement CSV export logic here
    return {
      message: 'Export functionality to be implemented',
      type,
      startDate,
      endDate,
    };
  }

  // Dashboard tổng quan
  async getDashboard(startDate?: string, endDate?: string) {
    const [revenue, orderStatus, topProducts, customerStats, paymentMethods] =
      await Promise.all([
        this.getRevenueOverview(startDate, endDate),
        this.getOrderStatusStats(startDate, endDate),
        this.getTopProducts(5, startDate, endDate),
        this.getCustomerStats(startDate, endDate),
        this.getPaymentMethodStats(startDate, endDate),
      ]);

    return {
      revenue,
      orderStatus,
      topProducts,
      customerStats,
      paymentMethods,
    };
  }
}
