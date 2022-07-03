const Booking = require("../models/Booking");
const MyError = require("../utils/myError");
const asyncHandler = require("express-async-handler");
const paginate = require("../utils/paginate");

const { valueRequired } = require("../lib/check");

exports.createBooking = asyncHandler(async (req, res) => {
  req.body.status = req.body.status || false;
  req.body.createUser = req.userId;

  let d = new Date();
  const orderCount = await Booking.find({}).count();
  let year = d.getFullYear();
  let month = d.getMonth();
  year = year.toString().substr(-2);
  month = (month + 1).toString();
  if (month.length === 1) {
    month = "0" + month;
  }

  req.body.bookingNumber = `B${year}${month}0${Math.floor(Math.random() * 10)}${
    orderCount + 1
  }`;

  const booking = await Booking.create(req.body);

  res.status(200).json({
    success: true,
    data: booking,
  });
});

exports.getBookings = asyncHandler(async (req, res) => {
  // Эхлээд query - уудаа аваад хоосон үгүйг шалгаад утга олгох
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 25;
  let sort = req.query.sort || { createAt: -1 };
  let status = req.query.status || null;
  const bookingNumber = req.query.bookingNumber || null;
  const bookingType = req.query.bookingType || null;
  const service = req.query.service || null;
  const date = req.query.date || null;
  const time = req.query.time || null;

  if (sort)
    if (typeof sort === "string") {
      sort = JSON.parse("{" + req.query.sort + "}");
    }

  ["select", "sort", "page", "limit", "status", "name"].forEach(
    (el) => delete req.query[el]
  );

  const query = Booking.find();

  if (valueRequired(bookingNumber))
    query.find({
      bookingNumber: { $regex: ".*" + bookingNumber + ".*", $options: "i" },
    });

  if (valueRequired(status)) query.where("status").equals(status);
  if (valueRequired(bookingType))
    query.where("bookingType").equals(bookingType);
  if (valueRequired(service)) query.where("service").equals(service);
  if (valueRequired(date)) query.where("date").equals(date);
  if (valueRequired(time)) query.where("time").equals(time);

  query
    .populate("createUser")
    .populate("bookingType")
    .populate("service")
    .populate("createUser");

  query.sort(sort);

  const qc = query.toConstructor();
  const clonedQuery = new qc();
  const result = await clonedQuery.count();

  const pagination = await paginate(page, limit, null, result);
  query.skip(pagination.start - 1);
  query.limit(limit);

  const booking = await query.exec();

  res.status(200).json({
    success: true,
    count: booking.length,
    data: booking,
    pagination,
  });
});

exports.getBooking = asyncHandler(async (req, res, next) => {
  const booking = await Booking.findById(req.params.id)
    .populate("createUser")
    .populate("bookingType")
    .populate("service");

  if (!booking) {
    throw new MyError("Тухайн үйлчилгээний захиалга олдсонгүй. ", 404);
  }

  res.status(200).json({
    success: true,
    data: booking,
  });
});

exports.bookingTime = asyncHandler(async (req, res) => {
  // 2022.6.28
  const service = req.query.service;
  const date = req.query.date;
  const time = req.query.time;
  const id = req.query.id || null;
  let bookingTime;
  if (valueRequired(id)) {
    bookingTime = await Booking.find({})
      .where("status")
      .equals(true)
      .where("date")
      .equals(date)
      .where("service")
      .equals(service);
  } else {
    bookingTime = await Booking.find({})
      .where("status")
      .equals(true)
      .where("date")
      .equals(date)
      .where("service")
      .equals(service);
  }

  const times = [
    "08:00",
    "09:00",
    "10:00",
    "11:00",
    "12:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
    "18:00",
  ];

  if (bookingTime) {
    bookingTime.map((booking) => {
      const index = times.indexOf(booking.time);
      if (index > -1) times.splice(index, 1);
    });
  }

  res.status(200).json({
    success: true,
    data: times,
  });
});

exports.deleteBooking = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const deleteBooking = await Booking.findByIdAndDelete(id);

  if (!deleteBooking) throw new MyError("Тухайн захиалга олдсонгүй. ", 404);

  res.status(200).json({
    success: true,
    data: deleteBooking,
  });
});

exports.multDeleteBooking = asyncHandler(async (req, res, next) => {
  const ids = req.queryPolluted.id;
  const findBookings = await Booking.find({ _id: { $in: ids } });

  if (findBookings.length <= 0) {
    throw new MyError("Таны сонгосон захиалгууд олдсонгүй", 400);
  }

  const booking = await Booking.deleteMany({ _id: { $in: ids } });

  res.status(200).json({
    success: true,
    data: booking,
  });
});

exports.updateBooking = asyncHandler(async (req, res, next) => {
  let booking = await Booking.findById(req.params.id);

  if (!booking) {
    throw new MyError("Тухайн захиалга олдсонгүй. ", 404);
  }

  req.body.updateUser = req.userId;
  booking = await Booking.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: booking,
  });
});

exports.getCounBooking = asyncHandler(async (req, res, next) => {
  const booking = await Booking.count();
  res.status(200).json({
    success: true,
    data: booking,
  });
});
