const BookingType = require("../models/BookingType");
const MyError = require("../utils/myError");
const asyncHandler = require("express-async-handler");
const paginate = require("../utils/paginate");

const { valueRequired } = require("../lib/check");

exports.createBookingType = asyncHandler(async (req, res) => {
  req.body.createUser = req.userId;
  const bookingType = await BookingType.create(req.body);

  res.status(200).json({
    success: true,
    data: bookingType,
  });
});

exports.getBookingTypes = asyncHandler(async (req, res) => {
  // Эхлээд query - уудаа аваад хоосон үгүйг шалгаад утга олгох
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 25;
  let sort = req.query.sort || { createAt: -1 };
  const name = req.query.name || null;

  if (sort)
    if (typeof sort === "string") {
      sort = JSON.parse("{" + req.query.sort + "}");
    }

  ["select", "sort", "page", "limit", "status", "name"].forEach(
    (el) => delete req.query[el]
  );

  const query = BookingType.find();

  if (valueRequired(name))
    query.find({
      name: {
        $regex: ".*" + name + ".*",
        $options: "i",
      },
    });

  query.populate("createUser");
  query.sort(sort);

  const qc = query.toConstructor();
  const clonedQuery = new qc();
  const result = await clonedQuery.count();

  const pagination = await paginate(page, limit, null, result);
  query.skip(pagination.start - 1);
  query.limit(limit);

  const bookingType = await query.exec();

  res.status(200).json({
    success: true,
    count: bookingType.length,
    data: bookingType,
    pagination,
  });
});

exports.getBookingType = asyncHandler(async (req, res, next) => {
  const bookingType = await BookingType.findById(req.params.id).populate(
    "createUser"
  );

  if (!bookingType) {
    throw new MyError("Тухайн үйлчилгээний төлөв олдсонгүй. ", 404);
  }

  res.status(200).json({
    success: true,
    data: bookingType,
  });
});

exports.deleteBookingType = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const deleteBookingType = await BookingType.findByIdAndDelete(id);

  if (!deleteBookingType)
    throw new MyError("Тухайн захиалгын төлөв олдсонгүй. ", 404);

  res.status(200).json({
    success: true,
    data: deleteBookingType,
  });
});

exports.multDeleteBookingType = asyncHandler(async (req, res, next) => {
  const ids = req.queryPolluted.id;
  const findBookingTypes = await BookingType.find({ _id: { $in: ids } });

  if (findBookingTypes.length <= 0) {
    throw new MyError("Таны сонгосон захиалгын төлөв олдсонгүй", 400);
  }

  const bookingType = await BookingType.deleteMany({ _id: { $in: ids } });

  res.status(200).json({
    success: true,
    data: bookingType,
  });
});

exports.updateBookingType = asyncHandler(async (req, res, next) => {
  let bookingType = await BookingType.findById(req.params.id);

  if (!bookingType) {
    throw new MyError("Тухайн захиалгын төлөв олдсонгүй. ", 404);
  }

  req.body.updateUser = req.userId;
  bookingType = await BookingType.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: bookingType,
  });
});

exports.getCounBookingType = asyncHandler(async (req, res, next) => {
  const bookingType = await BookingType.count();
  res.status(200).json({
    success: true,
    data: bookingType,
  });
});
