import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getAllReports = async (req, res, next) => {
  try {
    const { userId } = req.query;

    const reports = await prisma.report.findMany({
      where: userId ? { userId } : {},
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      },
      orderBy: { reportDate: 'desc' }
    });

    res.json({ data: reports });
  } catch (error) {
    next(error);
  }
};

export const getReportById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const report = await prisma.report.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

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
    const { title, description, fileUrl, reportType, reportDate, userId } = req.body;

    if (!title || !reportType || !reportDate || !userId) {
      return res.status(400).json({ 
        error: { message: 'Title, reportType, reportDate, and userId are required' } 
      });
    }

    const report = await prisma.report.create({
      data: {
        title,
        description,
        fileUrl,
        reportType,
        reportDate: new Date(reportDate),
        userId
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    res.status(201).json({ data: report });
  } catch (error) {
    if (error.code === 'P2003') {
      return res.status(404).json({ error: { message: 'User not found' } });
    }
    next(error);
  }
};

export const updateReport = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, fileUrl, reportType, reportDate } = req.body;

    const report = await prisma.report.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(fileUrl !== undefined && { fileUrl }),
        ...(reportType && { reportType }),
        ...(reportDate && { reportDate: new Date(reportDate) })
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    res.json({ data: report });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: { message: 'Report not found' } });
    }
    next(error);
  }
};

export const deleteReport = async (req, res, next) => {
  try {
    const { id } = req.params;

    await prisma.report.delete({
      where: { id }
    });

    res.json({ message: 'Report deleted successfully' });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: { message: 'Report not found' } });
    }
    next(error);
  }
};