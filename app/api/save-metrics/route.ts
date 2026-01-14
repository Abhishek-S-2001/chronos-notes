import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sessionID, noteTitle, keystrokeLog } = body;

    // Define where to save the dataset (root of your project)
    const filePath = path.join(process.cwd(), "dataset.json");

    let currentData = [];

    // 1. Check if file exists and read current data
    if (fs.existsSync(filePath)) {
      const fileContent = fs.readFileSync(filePath, "utf-8");
      if (fileContent) {
        currentData = JSON.parse(fileContent);
      }
    }

    // 2. Append new session data
    const newEntry = {
      id: sessionID || Date.now(), // Unique ID for this typing session
      timestamp: new Date().toISOString(),
      noteTitle: noteTitle,
      platform: "Mac/Chrome", // You can make this dynamic later
      data: keystrokeLog, // The array of dwell/flight times
    };

    currentData.push(newEntry);

    // 3. Write back to file
    fs.writeFileSync(filePath, JSON.stringify(currentData, null, 2));

    return NextResponse.json({ success: true, message: "Data saved successfully" });

  } catch (error) {
    console.error("Error saving dataset:", error);
    return NextResponse.json({ success: false, error: "Failed to save data" }, { status: 500 });
  }
}