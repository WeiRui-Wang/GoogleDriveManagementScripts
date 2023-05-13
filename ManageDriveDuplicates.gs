// Replace this with your Google Sheet ID where file signatures are stored
const SIGNATURES_SHEET_ID = "your-google-sheet-id";

// Set the maximum runtime for Google Apps Script in milliseconds
const MAX_RUNTIME_MS = 294000;

// Define a file path pattern for checking specific file paths.
// Replace your-regex-pattern with the actual regex pattern.
const USER_FILE_PATH_PATTERN = /^your-regex-pattern$/;

// This function manages duplicate files in Google Drive
function manageDuplicateFilesInDrive() {
  // Retrieve properties and continuation token for script execution
  let scriptProperties = PropertiesService.getScriptProperties();
  let continuationToken = scriptProperties.getProperty("CONTINUATION_TOKEN");

  // Initialize file iterator based on the availability of a continuation token
  let files;
  if (continuationToken) {
    files = DriveApp.continueFileIterator(continuationToken);
    console.log("Continuation token found. Resuming file iteration...");
  } else {
    files = DriveApp.getFiles();
    console.log("No continuation token found. Starting new file iteration...");
  }

  // Record script start time for runtime checks
  let startTime = new Date().getTime();
  console.log("Script started at: " + new Date(startTime));

  // Retrieve existing file signatures from the Google Sheet
  let fileSignatures = getFileSignaturesFromSheet();
  console.log("File signatures successfully retrieved from the Google Sheet.");

  // Iterate through each file in the Drive
  while (files.hasNext()) {
    let file = files.next();
    const fileName = file.getName();
    const fileSize = file.getSize();

    // Normalize the file name and generate the file signature
    const normalizedFileName = normalizeFileName(fileName);
    const fileSignature = normalizedFileName.concat(fileSize);

    // Retrieve the ID of the current file
    const fileId = file.getId();

    // Check if the file signature exists in the signatures from the Sheet
    if (fileSignatures[fileSignature]) {
      let duplicateFile = getDuplicateFile(fileSignatures[fileSignature][0]);

      // Check if the current file is a duplicate
      if (duplicateFile.getId() !== fileId) {
        console.log("Duplicate file detected: " + fileId);
        trashAppropriateFile(
          file,
          duplicateFile,
          fileSignatures,
          fileSignature,
          fileId,
          USER_FILE_PATH_PATTERN
        );
      }
    } else {
      fileSignatures[fileSignature] = [fileId];
    }

    // Check if the script has exceeded the maximum runtime
    if (new Date().getTime() - startTime > MAX_RUNTIME_MS) {
      console.log(
        "Maximum script runtime reached. Saving progress and exiting..."
      );
      saveFileSignaturesToSheet(fileSignatures);
      scriptProperties.setProperty(
        "CONTINUATION_TOKEN",
        files.getContinuationToken()
      );
      break;
    }
  }

  // If all files have been processed, save the file signatures and delete the continuation token
  if (!files.hasNext()) {
    console.log(
      "All files processed. Saving final signatures and deleting continuation token..."
    );
    saveFileSignaturesToSheet(fileSignatures);
    scriptProperties.deleteProperty("CONTINUATION_TOKEN");
  }
}

// Function to retrieve file signatures from the Google Sheet
function getFileSignaturesFromSheet() {
  const sheet = SpreadsheetApp.openById(SIGNATURES_SHEET_ID).getActiveSheet();
  const data = sheet.getDataRange().getValues();

  // Use a map to store file signatures for easy lookup
  let fileSignatures = {};

  data.forEach((row) => {
    const signature = row[0];
    const fileId = row[1];

    // Add each file signature and its corresponding fileId to the map
    fileSignatures[signature] = [fileId];
  });

  return fileSignatures;
}

// Function to save the current file signatures to the Google Sheet
function saveFileSignaturesToSheet(fileSignatures) {
  const sheet = SpreadsheetApp.openById(SIGNATURES_SHEET_ID).getActiveSheet();
  // Clear the existing data in the sheet before saving new data
  sheet.clear();
  console.log("Google Sheet cleared for updated file signatures.");

  // Convert the file signatures map to a format suitable for the Google Sheet
  let data = Object.entries(fileSignatures).map(([signature, fileId]) => [
    signature,
    ...fileId,
  ]);

  // Write the updated file signatures to the Google Sheet
  sheet.getRange(1, 1, data.length, data[0].length).setValues(data);
  console.log("Updated file signatures saved to Google Sheet.");
}

// Function to normalize file name by removing 'Copy of' prefix and any numbers in parentheses
function normalizeFileName(fileName) {
  const copyOfRemoved = fileName.replace(/^Copy of /, "");
  const numberRemoved = copyOfRemoved.replace(/(\(\d+\))(?=\.[^.]+$)/, "");

  return numberRemoved;
}

// Function to get the full file path of a file
function getFilePath(file) {
  // Helper function to recursively find the full path of a folder
  function getFolderPath(folder) {
    let parentIter = folder.getParents();
    if (parentIter.hasNext()) {
      return getFolderPath(parentIter.next()) + "/" + folder.getName();
    } else {
      return folder.getName();
    }
  }

  let parents = file.getParents();
  if (parents.hasNext()) {
    return getFolderPath(parents.next()) + "/" + file.getName();
  } else {
    return file.getName();
  }
}

// Function to get the duplicate file object using the file ID
function getDuplicateFile(id) {
  try {
    return DriveApp.getFileById(id);
  } catch (e) {
    console.error(`Error getting file with id ${id}: ${e}`);
  }
}

// Function to decide which file to trash based on their update dates and file paths
function trashAppropriateFile(
  currentFile,
  duplicateFile,
  fileSignatures,
  currentFileSignature,
  currentFileId,
  pattern
) {
  if (currentFile.getLastUpdated() > duplicateFile.getLastUpdated()) {
    var dupFilePath = getFilePath(duplicateFile);
    if (pattern.test(dupFilePath)) {
      currentFile.setTrashed(true);
      console.log(
        `Trashing current file ${currentFileId} based on update dates and file paths.`
      );
    } else {
      duplicateFile.setTrashed(true);
      fileSignatures[currentFileSignature] = [currentFileId];
      console.log(
        `Trashing duplicate file ${duplicateFile.getId()} based on update dates and file paths.`
      );
    }
  } else {
    var filePath = getFilePath(currentFile);
    if (pattern.test(filePath)) {
      duplicateFile.setTrashed(true);
      fileSignatures[currentFileSignature] = [currentFileId];
      console.log(
        `Trashing duplicate file ${duplicateFile.getId()} based on update dates and file paths.`
      );
    } else {
      currentFile.setTrashed(true);
      console.log(
        `Trashing current file ${currentFileId} based on update dates and file paths.`
      );
    }
  }
}
