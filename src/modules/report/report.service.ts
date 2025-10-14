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
    const filter = this.getDateFilter(startDate, endDate);

    const groupByFormat: any = {
      day: {
        year: { $year: '$createdAt' },
        month: { $month: '$createdAt' },
        day: { $dayOfMonth: '$createdAt' },
      },
      week: {
        year: { $year: '$createdAt' },
        week: { $week: '$createdAt' },
      },
      month: {
        year: { $year: '$createdAt' },
        month: { $month: '$createdAt' },
      },
    };

    const data = await this.orderModel.aggregate([
      { $match: { ...filter, paymentStatus: 'paid' } },
      {
        $group: {
          _id: groupByFormat[period],
          revenue: { $sum: '$total' },
          orders: { $sum: 1 },
          averageOrderValue: { $avg: '$total' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
    ]);

    return data.map((item) => ({
      period: item._id,
      revenue: item.revenue,
      orders: item.orders,
      averageOrderValue: item.averageOrderValue,
    }));
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
