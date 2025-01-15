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

export async function GET(request: Request) {
  const url = new URL(request.url);
  const status = url.searchParams.get("status");
  const page = parseInt(url.searchParams.get("page") || "1");
  try {
    const paginatedRequests = getMockItemRequests(status, page);
    return new Response(JSON.stringify(paginatedRequests), {
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

export async function PUT(request: Request) {
  try {
    // Connect to the database
    await connectDB();

    // Parse the request body
    const { requestorName, itemRequested } = await request.json();

    // Validate the input
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

    // Create a new request document
    const newRequest = new Request({
      requestorName,
      itemRequested,
      createdDate: new Date(),
      lastEditedDate: new Date(),
      status: "pending",
    });

    // Save the document to the database
    const savedRequest = await newRequest.save();

    // Return the created request
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
