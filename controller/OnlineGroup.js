const OnlineGroup = require("../models/OnlineGroup");
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

exports.createOnlineGroup = asyncHandler(async (req, res) => {
  req.body.createUser = req.userId;
  let fileNames, videoName;
  const files = req.files;
  req.body.price = parseInt(req.body.price);

  if (!files || !files.pictures) throw new MyError("Зураг оруулна уу");

  if (files.pictures.length > 1) {
    fileNames = await multImages(files, Date.now());
  } else {
    fileNames = await fileUpload(files.pictures, Date.now());
    fileNames = [fileNames.fileName];
  }

  req.body.pictures = fileNames;

  const onlineGroup = await OnlineGroup.create(req.body);

  res.status(200).json({
    success: true,
    data: OnlineGroup,
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

exports.getOnlineGroups = asyncHandler(async (req, res) => {
  // Эхлээд query - уудаа аваад хоосон үгүйг шалгаад утга олгох
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 25;
  let sort = req.query.sort || { createAt: -1 };
  const name = req.query.name || null;
  const status = req.query.status || null;

  if (valueRequired(sort)) {
    sort === "old" ? (sort = { createAt: 1 }) : (sort = { createAt: -1 });
  }

  ["select", "sort", "page", "limit", "status", "name"].forEach(
    (el) => delete req.query[el]
  );

  const query = OnlineGroup.find();

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

  const onlineGroup = await query.exec();

  res.status(200).json({
    success: true,
    count: onlineGroup.length,
    data: onlineGroup,
    pagination,
  });
});

exports.getOnlineGroup = asyncHandler(async (req, res, next) => {
  const onlineGroup = await OnlineGroup.findById(req.params.id).populate(
    "createUser"
  );

  if (!onlineGroup) {
    throw new MyError("Тухайн мэдээлэл олдсонгүй. ", 404);
  }

  res.status(200).json({
    success: true,
    data: onlineGroup,
  });
});

exports.deleteOnlineGroup = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const deleteOnlineGroup = await OnlineGroup.findByIdAndDelete(id);
  if (!deleteOnlineGroup) throw new MyError("Тухайн мэдээлэл олдсонгүй. ", 404);

  await imageDelete(deleteOnlineCourse.pictures);

  res.status(200).json({
    success: true,
    data: deleteOnlineGroup,
  });
});

exports.multDeleteOnlineGroup = asyncHandler(async (req, res, next) => {
  const ids = req.queryPolluted.id;
  const findOnlineGroups = await OnlineGroup.find({ _id: { $in: ids } });

  if (findOnlineGroups.length <= 0) {
    throw new MyError("Таны сонгосон сургалтууд олдсонгүй", 400);
  }

  findOnlineGroups.map(async (el) => {
    await imageDelete(el.pictures);
  });

  const onlineGroup = await OnlineGroup.deleteMany({ _id: { $in: ids } });

  res.status(200).json({
    success: true,
    data: onlineGroup,
  });
});

exports.updateOnlineGroup = asyncHandler(async (req, res, next) => {
  let onlineGroup = await OnlineGroup.findById(req.params.id);
  req.body.updateUser = req.userId;
  req.body.createUser = onlineGroup.createUser;
  let fileNames = "";
  const files = req.files;
  let oldPictures = req.body.oldPictures;

  if (!req.body.oldPictures && !files) {
    throw new MyError("Та зураг upload хийнэ үү", 400);
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
  }

  if (oldPictures) {
    typeof oldPictures != "string"
      ? (req.body.pictures = [...oldPictures, ...fileNames])
      : (req.body.pictures = [oldPictures, ...fileNames]);
  } else {
    req.body.pictures = fileNames;
  }

  onlineGroup = await OnlineGroup.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: onlineGroup,
  });
});

exports.getCounOnlineGroup = asyncHandler(async (req, res, next) => {
  const onlineGroup = await OnlineGroup.count();
  res.status(200).json({
    success: true,
    data: onlineGroup,
  });
});
