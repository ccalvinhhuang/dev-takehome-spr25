import { RESPONSES, ResponseType } from "@/lib/types/apiResponse";
import {
  createNewMockRequest,
  editMockStatusRequest,
  getMockItemRequests,
} from "@/server/mock/requests";
import { ServerResponseBuilder } from "@/lib/builders/serverResponseBuilder";
import { InputException } from "@/lib/errors/inputExceptions";
import Request from "./models/Request";
import connectDB from "@/lib/db";

const PAGINATION_PAGE_SIZE = 10;

export async function GET(request: Request) {
  try {
    await connectDB();
    const url = new URL(request.url);
    const status = url.searchParams.get("status");
    const page = parseInt(url.searchParams.get("page") || "1");

    if (isNaN(page) || page < 1) {
      return new Response(
        JSON.stringify(RESPONSES[ResponseType.INVALID_INPUT]),
        {
          status: RESPONSES[ResponseType.INVALID_INPUT].code,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const query: any = {};
    if (status) {
      if (!["pending", "completed", "approved", "rejected"].includes(status)) {
        return new Response(
          JSON.stringify(RESPONSES[ResponseType.INVALID_INPUT]),
          {
            status: RESPONSES[ResponseType.INVALID_INPUT].code,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
      query.status = status;
    }

    const skip = (page - 1) * PAGINATION_PAGE_SIZE;

    const requests = await Request.find(query)
      .sort({ createdDate: -1 })
      .skip(skip)
      .limit(PAGINATION_PAGE_SIZE);

    const totalRequests = await Request.countDocuments(query);

    const response = {
      data: requests,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalRequests / PAGINATION_PAGE_SIZE),
        totalRequests,
      },
    };

    return new Response(JSON.stringify(response), {
      status: RESPONSES[ResponseType.SUCCESS].code,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching requests:", error);
    return new Response(JSON.stringify(RESPONSES[ResponseType.UNKNOWN_ERROR]), {
      status: RESPONSES[ResponseType.UNKNOWN_ERROR].code,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function PUT(request: Request) {
  try {
    await connectDB();

    const { requestorName, itemRequested } = await request.json();

    if (
      !requestorName ||
      typeof requestorName !== "string" ||
      requestorName.length < 3 ||
      requestorName.length > 30
    ) {
      return new Response(
        JSON.stringify(RESPONSES[ResponseType.INVALID_INPUT]),
        {
          status: RESPONSES[ResponseType.INVALID_INPUT].code,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    if (
      !itemRequested ||
      typeof itemRequested !== "string" ||
      itemRequested.length < 2 ||
      itemRequested.length > 100
    ) {
      return new Response(
        JSON.stringify(RESPONSES[ResponseType.INVALID_INPUT]),
        {
          status: RESPONSES[ResponseType.INVALID_INPUT].code,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const newRequest = new Request({
      requestorName,
      itemRequested,
      createdDate: new Date(),
      lastEditedDate: new Date(),
      status: "pending",
    });

    const savedRequest = await newRequest.save();
    return new Response(JSON.stringify(savedRequest), {
      status: RESPONSES[ResponseType.CREATED].code,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error creating new request:", error);
    return new Response(JSON.stringify(RESPONSES[ResponseType.UNKNOWN_ERROR]), {
      status: RESPONSES[ResponseType.UNKNOWN_ERROR].code,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function PATCH(request: Request) {
  try {
    await connectDB();
    const { id, status } = await request.json();

    // Validate `id`
    if (!id || typeof id !== "string") {
      return new Response(
        JSON.stringify(RESPONSES[ResponseType.INVALID_INPUT]),
        {
          status: RESPONSES[ResponseType.INVALID_INPUT].code,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Validate `status`
    if (
      !status ||
      !["pending", "completed", "approved", "rejected"].includes(status)
    ) {
      return new Response(
        JSON.stringify(RESPONSES[ResponseType.INVALID_INPUT]),
        {
          status: RESPONSES[ResponseType.INVALID_INPUT].code,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Update the request in the database
    const updatedRequest = await Request.findByIdAndUpdate(
      id,
      { status, lastEditedDate: new Date() },
      { new: true }
    );

    // Check if the request exists
    if (!updatedRequest) {
      return new Response(
        JSON.stringify({ error: "Request with the specified ID not found." }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Return the updated request
    return new Response(JSON.stringify(updatedRequest), {
      status: RESPONSES[ResponseType.SUCCESS].code,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error updating request:", error);
    return new Response(JSON.stringify(RESPONSES[ResponseType.UNKNOWN_ERROR]), {
      status: RESPONSES[ResponseType.UNKNOWN_ERROR].code,
      headers: { "Content-Type": "application/json" },
    });
  }
}
