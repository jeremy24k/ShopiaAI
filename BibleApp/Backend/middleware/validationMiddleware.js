const validateParams = (schema) => {
  return (req, res, next) => {
    const parseResult = schema.safeParse(req.params);
    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        error: parseResult.error.errors[0].message,
        details: parseResult.error.errors
      });
    }
    

    req.validatedParams = parseResult.data;
    next();
  };
};

export { validateParams };