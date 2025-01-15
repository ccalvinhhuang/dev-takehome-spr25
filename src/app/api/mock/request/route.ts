import { ResponseType } from "@/lib/types/apiResponse";
import {
  createNewMockRequest,
  editMockStatusRequest,
  getMockItemRequests,
} from "@/server/mock/requests";
import { ServerResponseBuilder } from "@/lib/builders/serverResponseBuilder";
import { InputException } from "@/lib/errors/inputExceptions";
import connectDB from "@/lib/db";
import Request from "@/models/Request";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const status = url.searchParams.get("status");
  const page = parseInt(url.searchParams.get("page") || "1");
  try {
    const paginatedRequests = await getMockItemRequests(status, page);
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
    const { requestorName, itemRequested } = await request.json();

    if (!requestorName || !itemRequested) {
      return new Response(
        JSON.stringify({
          error: "Requestor name and item requested are required.",
        }),
        { status: 400 }
      );
    }

    await connectDB();
    const newRequest = new Request({
      requestorName,
      itemRequested,
    });

    const savedRequest = await newRequest.save();

    return new Response(JSON.stringify(savedRequest), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error handling PUT /api/request:", error);

    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
}

export async function PATCH(request: Request) {
  try {
    const request_m = await request.json();
    const edit = await editMockStatusRequest(request_m);
    return new Response(JSON.stringify(edit), {
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
