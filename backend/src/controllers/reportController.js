import Report from '../models/Report.js';


export const getReports = async (req, res, next) => {
  try {
    const { category, doctor, search, sort, page = 1, limit = 10 } = req.query;


    const query = { user: req.user.id };


    if (category) {
      query.category = category;
    }
    if (doctor) {
      query.doctor = doctor;
    }


    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }


    let sortOptions = { createdAt: -1 }; 
    if (sort) {
      if (sort === 'date') {
        sortOptions = { reportDate: 1 }; 
      } else if (sort === '-date') {
        sortOptions = { reportDate: -1 }; 
      } else {
       
        const sortField = sort.startsWith('-') ? sort.substring(1) : sort;
        const sortOrder = sort.startsWith('-') ? -1 : 1;
        sortOptions = { [sortField]: sortOrder };
      }
    }

  
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

 
    const reports = await Report.find(query)
      .populate('doctor', 'name specialization hospital')
      .populate('user', 'firstName lastName email')
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum);


    const total = await Report.countDocuments(query);

    res.json({
      data: reports,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
        limit: limitNum
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getReportById = async (req, res, next) => {
  try {
    const { id } = req.params;


    const report = await Report.findOne({ _id: id, user: req.user.id })
      .populate('user', 'firstName lastName email')
      .populate('doctor', 'name specialization hospital');

    if (!report) {
      return res.status(404).json({ error: { message: 'Report not found' } });
    }

    res.json({ data: report });
  } catch (error) {
    next(error);
  }
};

export const createReport = async (req, res, next) => {
  try {
    const { title, description, fileUrl, category, reportDate, doctor } = req.body;

    

    let finalFileUrl = fileUrl;
    if (req.file && req.file.path) {
      finalFileUrl = req.file.path;
    }

    if (!title || !category || !reportDate) {
      return res.status(400).json({
        error: { message: 'Title, category, and reportDate are required' }
      });
    }

    const report = await Report.create({
      title,
      description,
      fileUrl: finalFileUrl,
      category,
      reportDate: new Date(reportDate),
      user: req.user.id,
      doctor: doctor || undefined 
    });

    const populatedReport = await Report.findById(report._id)
      .populate('user', 'firstName lastName')
      .populate('doctor', 'name specialization');

    res.status(201).json({ data: populatedReport });
  } catch (error) {
    next(error);
  }
};

export const updateReport = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, fileUrl, category, reportDate, doctor } = req.body;

    const report = await Report.findOneAndUpdate(
      { _id: id, user: req.user.id }, 
      {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(fileUrl !== undefined && { fileUrl }),
        ...(category && { category }),
        ...(reportDate && { reportDate: new Date(reportDate) }),
        ...(doctor !== undefined && { doctor }) 
      },
      { new: true, runValidators: true }
    ).populate('user', 'firstName lastName');

    if (!report) {
      return res.status(404).json({ error: { message: 'Report not found or unauthorized' } });
    }

    res.json({ data: report });
  } catch (error) {
    next(error);
  }
};

export const deleteReport = async (req, res, next) => {
  try {
    const { id } = req.params;

    const report = await Report.findOneAndDelete({ _id: id, user: req.user.id }); 

    if (!report) {
      return res.status(404).json({ error: { message: 'Report not found or unauthorized' } });
    }

    res.json({ message: 'Report deleted successfully' });
  } catch (error) {
    next(error);
  }
};