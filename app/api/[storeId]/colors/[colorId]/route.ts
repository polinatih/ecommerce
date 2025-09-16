import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  context: { params: Promise<{ colorId: string }> }
) {
  try {
    const { colorId } = await context.params;

    if (!colorId) {
      return new NextResponse("Color id is required", { status: 400 });
    }

    const color = await prismadb.color.findUnique({
      where: { id: colorId },
    });

    return NextResponse.json(color);
  } catch (error) {
    console.log("[COLOR_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  context: { params: Promise<{ storeId: string; colorId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthenticated", { status: 401 });

    const { storeId, colorId } = await context.params;
    const { name, value } = await req.json();

    if (!name) return new NextResponse("Name is required", { status: 400 });
    if (!value) return new NextResponse("Value is required", { status: 400 });
    if (!colorId) return new NextResponse("Color id is required", { status: 400 });

    const storeByUserId = await prismadb.store.findFirst({
      where: { id: storeId, userId },
    });

    if (!storeByUserId) return new NextResponse("Unauthorized", { status: 403 });

    const color = await prismadb.color.update({
      where: { id: colorId },
      data: { name, value },
    });

    return NextResponse.json(color);
  } catch (error) {
    console.log("[COLOR_PATCH]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ storeId: string; colorId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthenticated", { status: 401 });

    const { storeId, colorId } = await context.params;
    if (!colorId) return new NextResponse("Color id is required", { status: 400 });

    const storeByUserId = await prismadb.store.findFirst({
      where: { id: storeId, userId },
    });

    if (!storeByUserId) return new NextResponse("Unauthorized", { status: 403 });

    const color = await prismadb.color.delete({
      where: { id: colorId },
    });

    return NextResponse.json(color);
  } catch (error) {
    console.log("[COLOR_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}