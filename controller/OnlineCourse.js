const OnlineCourse = require("../models/OnlineCourse");
const User = require("../models/User");
const MyError = require("../utils/myError");
const asyncHandler = require("express-async-handler");
const paginate = require("../utils/paginate");
const {
  multImages,
  fileUpload,
  imageDelete,
  videoUpload,
} = require("../lib/photoUpload");
const { valueRequired } = require("../lib/check");

exports.createOnlineCourse = asyncHandler(async (req, res) => {
  req.body.createUser = req.userId;
  let fileNames, videoName;
  const files = req.files;

  if (!files || !files.pictures) throw new MyError("Зураг оруулна уу");

  if (files.pictures.length > 1) {
    fileNames = await multImages(files, Date.now());
  } else {
    fileNames = await fileUpload(files.pictures, Date.now());
    fileNames = [fileNames.fileName];
  }

  if (!files.video) throw new MyError("Видео хичээл оруулна уу");

  if (files.video) {
    videoName = await videoUpload(files.video, "video");
    req.body.video = videoName.fileName;
  }

  req.body.pictures = fileNames;

  const onlineCourse = await OnlineCourse.create(req.body);

  res.status(200).json({
    success: true,
    data: OnlineCourse,
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

exports.getOnlineCourses = asyncHandler(async (req, res) => {
  // Эхлээд query - уудаа аваад хоосон үгүйг шалгаад утга олгох
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 25;
  let sort = req.query.sort || { createAt: -1 };
  const teacher = req.query.teacher || null;
  const name = req.query.name || null;
  const group = req.query.group || null;
  const status = req.query.status || null;
  const courseIs = req.query.courseIs || null;

  if (sort)
    if (typeof sort === "string") {
      sort = JSON.parse("{" + req.query.sort + "}");
    }

  ["select", "sort", "page", "limit", "status", "name"].forEach(
    (el) => delete req.query[el]
  );

  const query = OnlineCourse.find();

  if (valueRequired(name))
    query.find({
      name: { $regex: ".*" + name + ".*", $options: "i" },
    });

  if (valueRequired(courseIs)) query.where("courseIs").equals(courseIs);

  if (valueRequired(status)) query.where("pay").equals(status);

  if (valueRequired(teacher)) {
    query.where("teacher").equals(teacher);
  }

  if (valueRequired(group)) {
    query.where("group").equals(group);
  }

  query.populate("createUser").populate("teachers").populate("group");
  query.sort(sort);

  const qc = query.toConstructor();
  const clonedQuery = new qc();
  const result = await clonedQuery.count();

  const pagination = await paginate(page, limit, null, result);
  query.skip(pagination.start - 1);
  query.limit(limit);

  const onlineCourse = await query.exec();

  res.status(200).json({
    success: true,
    count: onlineCourse.length,
    data: onlineCourse,
    pagination,
  });
});

exports.getOnlineCourse = asyncHandler(async (req, res, next) => {
  const onlineCourse = await OnlineCourse.findById(req.params.id)
    .populate("createUser")
    .populate("teachers")
    .populate("group");

  if (!onlineCourse) {
    throw new MyError("Тухайн мэдээлэл олдсонгүй. ", 404);
  }

  res.status(200).json({
    success: true,
    data: onlineCourse,
  });
});

exports.deleteOnlineCourse = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const deleteOnlineCourse = await OnlineCourse.findByIdAndDelete(id);
  if (!deleteOnlineCourse)
    throw new MyError("Тухайн мэдээлэл олдсонгүй. ", 404);

  res.status(200).json({
    success: true,
    data: deleteOnlineCourse,
  });
});

exports.multDeleteOnlineCourse = asyncHandler(async (req, res, next) => {
  const ids = req.queryPolluted.id;
  const findOnlineCourses = await OnlineCourse.find({ _id: { $in: ids } });

  if (findOnlineCourses.length <= 0) {
    throw new MyError("Таны сонгосон сургалтууд олдсонгүй", 400);
  }

  findOnlineCourses.map(async (el) => {
    el.pictures.map(async (el) => {
      await imageDelete(el.pictures);
    });
    await imageDelete(el.video);
  });

  const onlineCourse = await OnlineCourse.deleteMany({ _id: { $in: ids } });

  res.status(200).json({
    success: true,
    data: onlineCourse,
  });
});

exports.updateOnlineCourse = asyncHandler(async (req, res, next) => {
  let onlineCourse = await OnlineCourse.findById(req.params.id);
  let fileNames = [];
  req.body.updateUser = req.userId;
  let oldPictures = req.body.oldPicture;
  let oldVideo = req.body.oldVideo;

  if (!onlineCourse) {
    throw new MyError("Тухайн сургалт олдсонгүй", 404);
  }

  const files = req.files;

  if (!oldPictures && !files) {
    throw new MyError("Та сургалтын зургаа оруулна уу", 400);
  }

  if (!oldVideo && !files) {
    throw new MyError("Та сургалтын видео хичээлээ оруулна уу", 400);
  }

  if (files) {
    if (files.pictures) {
      if (files.pictures.length >= 2) {
        fileNames = await multImages(files, "news");
      } else {
        fileNames = await fileUpload(files.pictures, "news");
        fileNames = [fileNames.fileName];
      }
    }
    if (files.video) {
      videoName = await videoUpload(files.video, "video");
      await imageDelete(oldVideo);
      oldVideo = videoName.fileName;
    }
  }

  if (oldPictures) {
    typeof oldPictures != "string"
      ? (req.body.pictures = [...oldPictures, ...fileNames])
      : (req.body.pictures = [oldPictures, ...fileNames]);
  } else {
    req.body.pictures = fileNames;
  }

  req.body.video = oldVideo;

  onlineCourse = await OnlineCourse.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: onlineCourse,
  });
});

exports.getCounOnlineCourse = asyncHandler(async (req, res, next) => {
  const onlineCourse = await OnlineCourse.count();
  res.status(200).json({
    success: true,
    data: onlineCourse,
  });
});
