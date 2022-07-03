const Employee = require("../models/Employee");
const MyError = require("../utils/myError");
const asyncHandler = require("express-async-handler");
const paginate = require("../utils/paginate");
const { multImages, fileUpload, imageDelete } = require("../lib/photoUpload");
const { valueRequired } = require("../lib/check");

exports.createEmployee = asyncHandler(async (req, res) => {
  req.body.status = req.body.status || false;
  req.body.createUser = req.userId;

  const files = req.files;
  if (!files || !files.picture) throw new MyError("Зураг оруулна уу");

  if (files.picture) {
    const pic = await fileUpload(files.picture, "employee").catch((error) => {
      throw new MyError(`Зураг хуулах явцад алдаа гарлаа: ${error}`, 408);
    });
    req.body.picture = pic.fileName;
  }

  const employee = await Employee.create(req.body);

  res.status(200).json({
    success: true,
    data: employee,
  });
});

exports.getEmployees = asyncHandler(async (req, res) => {
  // Эхлээд query - уудаа аваад хоосон үгүйг шалгаад утга олгох
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 25;
  let sort = req.query.sort || { createAt: -1 };
  const name = req.query.name || null;
  const status = req.query.status || null;

  if (sort)
    if (typeof sort === "string") {
      sort = JSON.parse("{" + req.query.sort + "}");
    }

  ["select", "sort", "page", "limit", "status", "name"].forEach(
    (el) => delete req.query[el]
  );

  const query = Employee.find();

  if (valueRequired(name))
    query.find({
      name: { $regex: ".*" + name + ".*", $options: "i" },
    });

  if (valueRequired(status)) {
    query.find({
      status: { $regex: ".*" + status + ".*", $options: "i" },
    });
  }

  query.populate("createUser");
  query.sort(sort);

  const qc = query.toConstructor();
  const clonedQuery = new qc();
  const result = await clonedQuery.count();

  const pagination = await paginate(page, limit, null, result);
  query.skip(pagination.start - 1);
  query.limit(limit);

  const employee = await query.exec();

  res.status(200).json({
    success: true,
    count: employee.length,
    data: employee,
    pagination,
  });
});

exports.getEmployee = asyncHandler(async (req, res, next) => {
  const employee = await Employee.findById(req.params.id).populate(
    "createUser"
  );

  if (!employee) {
    throw new MyError("Тухайн мэдээлэл олдсонгүй. ", 404);
  }

  res.status(200).json({
    success: true,
    data: employee,
  });
});

exports.deleteEmployee = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const deleteEmployee = await Employee.findByIdAndDelete(id);
  if (!deleteEmployee) throw new MyError("Тухайн мэдээлэл олдсонгүй. ", 404);

  res.status(200).json({
    success: true,
    data: deleteEmployee,
  });
});

exports.multDeleteEmployee = asyncHandler(async (req, res, next) => {
  const ids = req.queryPolluted.id;
  const findEmployees = await Employee.find({ _id: { $in: ids } });

  if (findEmployees.length <= 0) {
    throw new MyError("Таны сонгосон ажилтангууд олдсонгүй", 400);
  }

  const employee = await Employee.deleteMany({ _id: { $in: ids } });

  res.status(200).json({
    success: true,
    data: employee,
  });
});

exports.updateEmployee = asyncHandler(async (req, res, next) => {
  let employee = await Employee.findById(req.params.id);
  req.body.updateUser = req.userId;
  let oldPicture = req.body.oldPicture;

  const files = req.files;

  if (!oldPicture && !files) {
    throw new MyError("Та зураг оруулна уу", 400);
  }
  if (files) {
    if (files.picture) {
      const result = await fileUpload(files.picture, "avatar").catch(
        (error) => {
          throw new MyError(`Зураг хуулах явцад алдаа гарлаа: ${error} `, 400);
        }
      );
      req.body.picture = result.fileName;
      await imageDelete(oldPicture);
    }
  } else {
    req.body.picture = oldPicture;
  }

  employee = await Employee.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: employee,
  });
});

exports.getCounEmployee = asyncHandler(async (req, res, next) => {
  const employee = await Employee.count();
  res.status(200).json({
    success: true,
    data: employee,
  });
});
