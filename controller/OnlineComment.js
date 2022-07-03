const Comment = require("../models/OnlineComment");
const User = require("../models/User");
const MyError = require("../utils/myError");
const asyncHandler = require("express-async-handler");
const paginate = require("../utils/paginate");

const { valueRequired } = require("../lib/check");

exports.createComment = asyncHandler(async (req, res) => {
  req.body.createUser = req.userId;

  const comment = await Comment.create(req.body);

  res.status(200).json({
    success: true,
    data: comment,
  });
});

const userNameSearch = async (name) => {
  const user = await User.find({
    firstname: { $regex: ".*" + name + ".*", $options: "i" },
  })
    .select("_id")
    .limit(25);

  return user;
};

exports.getComments = asyncHandler(async (req, res) => {
  // Эхлээд query - уудаа аваад хоосон үгүйг шалгаад утга олгох
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 25;
  let sort = req.query.sort || { createAt: -1 };
  const comment = req.query.comment || null;
  const user = req.query.user || null;
  const onlineGroup = req.query.onlineGroup || null;
  const onlineCourse = req.query.onlineCourse || null;

  if (sort)
    if (typeof sort === "string") {
      sort = JSON.parse("{" + req.query.sort + "}");
    }

  ["select", "sort", "page", "limit", "status", "name"].forEach(
    (el) => delete req.query[el]
  );

  const query = Comment.find();

  if (valueRequired(comment))
    query.find({
      comment: { $regex: ".*" + comment + ".*", $options: "i" },
    });

  if (valueRequired(user)) {
    const users = await userNameSearch();
    if (users && users.length > 0) query.where("createUser").in(users);
  }
  if (valueRequired(onlineGroup)) query.where("onlineGroup", onlineGroup);
  if (valueRequired(onlineCourse)) query.where("onlineCourse", onlineCourse);

  query.populate("createUser");
  query.sort(sort);

  const qc = query.toConstructor();
  const clonedQuery = new qc();
  const result = await clonedQuery.count();

  const pagination = await paginate(page, limit, null, result);
  query.skip(pagination.start - 1);
  query.limit(limit);

  const resData = await query.exec();

  res.status(200).json({
    success: true,
    count: resData.length,
    data: resData,
    pagination,
  });
});

exports.getComment = asyncHandler(async (req, res, next) => {
  const comment = await Comment.findById(req.params.id).populate("createUser");

  if (!comment) {
    throw new MyError("Тухайн мэдээлэл олдсонгүй. ", 404);
  }

  res.status(200).json({
    success: true,
    data: comment,
  });
});

exports.deleteComment = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const deleteComment = await Comment.findByIdAndDelete(id);
  if (!deleteComment) throw new MyError("Тухайн мэдээлэл олдсонгүй. ", 404);

  res.status(200).json({
    success: true,
    data: deleteComment,
  });
});

exports.multDeleteComment = asyncHandler(async (req, res, next) => {
  const ids = req.queryPolluted.id;
  const findComments = await Comment.find({ _id: { $in: ids } });

  if (findComments.length <= 0) {
    throw new MyError("Таны сонгосон сэтгэгдэлүүд олдсонгүй", 400);
  }

  const comment = await Comment.deleteMany({ _id: { $in: ids } });

  res.status(200).json({
    success: true,
    data: comment,
  });
});

exports.updateComment = asyncHandler(async (req, res, next) => {
  let comment = await Comment.findById(req.params.id);
  req.body.updateUser = req.userId;

  comment = await Comment.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: comment,
  });
});

exports.getCounComment = asyncHandler(async (req, res, next) => {
  const comment = await Comment.count();
  res.status(200).json({
    success: true,
    data: comment,
  });
});
