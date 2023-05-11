// Constants
const CONTINUATION_TOKEN = "ContinuationToken";
const TIME_LIMIT_MS = 4.9 * 60 * 1000; // 4.9 minutes in milliseconds
const PATTERN = /^My Drive\/your_email_here\.edu\/\D+/;

// Recursively build the folder path of a given folder
function buildFolderPath(folder) {
  if (!folder) {
    return "";
  }

  let parentFolders = folder.getParents();
  let parentFolder;
  let fullPath = "";

  while (parentFolders.hasNext()) {
    parentFolder = parentFolders.next();
    fullPath = parentFolder.getName() + "/" + fullPath;
  }

  return buildFolderPath(parentFolder) + fullPath;
}

// Restore trashed files based on the specified pattern and log their original directories
function restoreFilteredTrashedFiles() {
  // Get the continuation token from the script properties
  let scriptProperties = PropertiesService.getScriptProperties();
  let continuationToken = scriptProperties.getProperty(CONTINUATION_TOKEN);

  // Get all trashed files using the continuation token if available
  let trashedFiles = continuationToken
    ? DriveApp.continueFileIterator(continuationToken)
    : DriveApp.getTrashedFiles();

  // Set a time limit to avoid exceeding maximum execution time
  let startTime = new Date().getTime();

  // Iterate through trashed files and restore those that match the pattern
  while (trashedFiles.hasNext()) {
    try {
      let file = trashedFiles.next();
      let parentFolders = file.getParents();

      if (file.getMimeType() == "application/pdf") {
        file.setTrashed(false);
        Logger.log("Restored PDF file: " + file.getName());
        continue;
      }

      while (parentFolders.hasNext()) {
        let parentFolder = parentFolders.next();
        let filePath = buildFolderPath(parentFolder) + file.getName();

        // Check if the file path matches the pattern and the file is not a PDF
        if (file.getMimeType() == "application/pdf" || PATTERN.test(filePath)) {
          // Restore the file and log the restored file path
          file.setTrashed(false);
          Logger.log("Restored file with matching pattern: " + filePath);
        } else {
          Logger.log("Skipped file (pattern not matched): " + filePath);
        }
      }
    } catch (error) {
      Logger.log("Error (" + error.name + "): " + error.message);
    }

    // Check if the time limit is reached
    if (new Date().getTime() - startTime > TIME_LIMIT_MS) {
      // Save the continuation token and stop processing
      continuationToken = trashedFiles.getContinuationToken();
      scriptProperties.setProperty(CONTINUATION_TOKEN, continuationToken);
      Logger.log(
        "Saved continuation token for next execution: " + continuationToken
      );
      return;
    }
  }

  // Clear the continuation token when done
  scriptProperties.deleteProperty(CONTINUATION_TOKEN);
  Logger.log("All trashed files processed. Continuation token cleared.");

  // Log that the process is complete
  Logger.log("Restored trashed files from filtered directories.");
}
