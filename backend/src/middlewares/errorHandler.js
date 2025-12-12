const errorHandler = (err, req, res, next) => {
  let out = {
    message: err.message,
    statusCode: err.statusCode,
  };

  if (process.env.NODE_ENV === "development") {
    console.error(err);
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0];
    const formatted = field
      ? field.charAt(0).toUpperCase() + field.slice(1) + " already exists"
      : "Duplicate value";
    out = { message: formatted, statusCode: 400 };
  } else if (err.name === "ValidationError") {
    const msg = Object.values(err.errors || {})
      .map((e) => e.message)
      .join(", ");
    out = { message: msg, statusCode: 400 };
  } else if (err.name === "CastError") {
    out = { message: "Resource not found", statusCode: 404 };
  }

  res.status(out.statusCode || 500).json({
    success: false,
    message: out.message || "Server Error",
    ...(process.env.NODE_ENV === "development" ? { stack: err.stack } : {}),
  });
};

export default errorHandler;