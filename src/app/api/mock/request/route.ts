import { ResponseType } from "@/lib/types/apiResponse";
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
    const page = parseInt(url.searchParams.get("page") || "1");

    if (isNaN(page) || page < 1) {
      return new Response(
        JSON.stringify({ error: "Invalid page number. Must be >= 1." }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const skip = (page - 1) * PAGINATION_PAGE_SIZE;
    const requests = await Request.find()
      .sort({ createdDate: -1 })
      .skip(skip)
      .limit(PAGINATION_PAGE_SIZE);

    const totalRequests = await Request.countDocuments();
    const response = {
      data: requests,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalRequests / PAGINATION_PAGE_SIZE),
        totalRequests,
      },
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("error:", error);
    return new Response(JSON.stringify({ error: "some weird error." }), {
      status: 500,
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
        JSON.stringify({
          error:
            "'requestorName' must be a string between 3 and 30 characters.",
        }),
        {
          status: 400,
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
        JSON.stringify({
          error:
            "'itemRequested' must be a string between 2 and 100 characters.",
        }),
        {
          status: 400,
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
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error creating new request:", error);
    return new Response(JSON.stringify({ error: "Internal server error." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function PATCH(request: Request) {
  try {
    const req = await request.json();
    const editedRequest = editMockStatusRequest(req);
    return new Response(JSON.stringify(editedRequest), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    if (e instanceof InputException) {
      return new ServerResponseBuilder(ResponseType.INVALID_INPUT).build();
    }
    return new ServerResponseBuilder(ResponseType.UNKNOWN_ERROR).build();
  }
}
