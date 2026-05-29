import prisma from "../db/prisma.js";

export const createDonationPost = async (req, res) => {
  try {
    const userId = req.userId;
    const { title, description } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: "Title and description are required." });
    }

    const donation = await prisma.donationPost.create({
      data: {
        title,
        description,
        image: req.file ? req.file.filename : null,
        creatorId: userId,
      },
    });

    res.status(201).json({
      message: "Donation post created successfully",
      donation,
    });
  } catch (error) {
    console.error("Error creating donation post", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


export const getAllDonationPosts = async (req, res) => {
  try {
    const donations = await prisma.donationPost.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        creator: {
          select: {
            id: true,
            fullName: true,
            profileImage: true,
          },
        },
      },
    });

    res.status(200).json({ donations });
  } catch (error) {
    console.error("Error fetching donation posts", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const applyForDonation = async (req, res) => {
  try {
    const userId = req.userId;
    const { donationPostId, message } = req.body;

    if (!donationPostId) {
      return res.status(400).json({ message: "Donation post ID is required." });
    }

    const donationExists = await prisma.donationPost.findUnique({
      where: { id: donationPostId },
    });

    if (!donationExists) {
      return res.status(404).json({ message: "Donation post not found." });
    }

    const application = await prisma.donationApplication.create({
      data: {
        userId,
        donationPostId,
        message,
      },
    });

    res.status(201).json({
      message: "Applied for donation successfully",
      application,
    });
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(400).json({ message: "You already applied for this donation." });
    }

    console.error("Error applying for donation", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getIncomingDonationApplications = async (req, res) => {
  try {
    const userId = req.userId;

    const applications = await prisma.donationApplication.findMany({
      where: {
        donationPost: {
          creatorId: userId,
          isActive: true,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            profileImage: true,
          },
        },
        donationPost: {
          select: {
            id: true,
            title: true,
            description: true,
            image: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({ applications });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getOutgoingDonationApplications = async (req, res) => {
  try {
    const userId = req.userId;

    const applications = await prisma.donationApplication.findMany({
      where: { userId: userId },
      include: {
        donationPost: {
          select: {
            id: true,
            title: true,
            description: true,
            image: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({ applications });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};


export const updateDonationApplicationStatus = async (req, res) => {
  try {
    const userId = req.userId;
    const { applicationId, status } = req.body;

    if (!["APPROVED", "REJECTED"].includes(status)) {
      return res.status(400).json({ message: "Invalid status." });
    }

    const application = await prisma.donationApplication.findUnique({
      where: { id: applicationId },
      include: { donationPost: true },
    });

    if (!application || application.donationPost.creatorId !== userId) {
      return res.status(403).json({ message: "Not authorized." });
    }

    const updatedApplication = await prisma.donationApplication.update({
      where: { id: applicationId },
      data: { status },
    });

    if (status === "APPROVED") {
      await prisma.donationPost.update({
        where: { id: application.donationPostId },
        data: { isActive: false },
      });
    }

    res.status(200).json({
      message: `Application ${status.toLowerCase()}`,
      updatedApplication,
    });
  } catch (error) {
    console.error("Error updating application status", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteDonationPost = async (req, res) => {
  try {
    const userId = req.userId;
    const donationId = Number(req.params.id);

    const donation = await prisma.donationPost.findUnique({
      where: { id: donationId },
    });

    if (!donation || donation.creatorId !== userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await prisma.donationPost.delete({ where: { id: donationId } });

    res.status(200).json({
      message: "Donation post deleted, applications preserved for history",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};



