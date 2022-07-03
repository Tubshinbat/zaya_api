const ContentCategory = require("../models/ContentCategory");
const MyError = require("../utils/myError");
const asyncHandler = require("express-async-handler");
const paginate = require("../utils/paginate");

const { valueRequired } = require("../lib/check");

exports.createContentCategory = asyncHandler(async (req, res) => {
  req.body.createUser = req.userId;

  const contentCategory = await ContentCategory.create(req.body);

  res.status(200).json({
    success: true,
    data: contentCategory,
  });
});

exports.getContentCategories = asyncHandler(async (req, res) => {
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

  const query = ContentCategory.find();

  if (valueRequired(name))
    query.find({
      name: { $regex: ".*" + name + ".*", $options: "i" },
    });
  if (valueRequired(status)) query.where("status").equals(status);
  query.populate("createUser");
  query.sort(sort);

  const qc = query.toConstructor();
  const clonedQuery = new qc();
  const result = await clonedQuery.count();

  const pagination = await paginate(page, limit, null, result);
  query.skip(pagination.start - 1);
  query.limit(limit);

  const contentCategory = await query.exec();

  res.status(200).json({
    success: true,
    count: contentCategory.length,
    data: contentCategory,
    pagination,
  });
});

exports.getContentCategory = asyncHandler(async (req, res, next) => {
  const contentCategory = await ContentCategory.findById(
    req.params.id
  ).populate("createUser");

  if (!contentCategory) {
    throw new MyError("Тухайн мэдээлэл олдсонгүй. ", 404);
  }

  res.status(200).json({
    success: true,
    data: contentCategory,
  });
});

exports.deleteContentCategory = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const deleteContentCategory = await ContentCategory.findByIdAndDelete(id);

  if (!deleteContentCategory)
    throw new MyError("Тухайн мэдээлэл олдсонгүй. ", 404);

  res.status(200).json({
    success: true,
    data: deleteContentCategory,
  });
});

exports.multDeleteContentCategory = asyncHandler(async (req, res, next) => {
  const ids = req.queryPolluted.id;
  const findContentCategories = await ContentCategory.find({
    _id: { $in: ids },
  });

  if (findContentCategories.length <= 0) {
    throw new MyError("Таны сонгосон контентууд олдсонгүй", 400);
  }

  const contentCategory = await ContentCategory.deleteMany({
    _id: { $in: ids },
  });

  res.status(200).json({
    success: true,
    data: contentCategory,
  });
});

exports.updateContentCategory = asyncHandler(async (req, res, next) => {
  let contentCategory = await ContentCategory.findById(req.params.id);

  if (!contentCategory) {
    throw new MyError("Тухайн мэдээлэл олдсонгүй. ", 404);
  }

  req.body.updateUser = req.userId;
  contentCategory = await ContentCategory.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({
    success: true,
    data: contentCategory,
  });
});

exports.getCounContentCategory = asyncHandler(async (req, res, next) => {
  const contentCategory = await ContentCategory.count();
  res.status(200).json({
    success: true,
    data: contentCategory,
  });
});
