const CONTINUATION_TOKEN = "CONTINUATION_TOKEN";
const TIME_LIMIT_MS = 4.9 * 60 * 1000; // 4.9 minutes in milliseconds

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

  // Iterate through trashed files and restore PDF files
  while (trashedFiles.hasNext()) {
    try {
      let file = trashedFiles.next();

      if (file.getMimeType() == "application/pdf") {
        file.setTrashed(false);
        Logger.log("Restored PDF file: " + file.getName());
      } else {
        Logger.log("Skipped file (not a PDF): " + file.getName());
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
  Logger.log("Restored trashed PDF files.");
}
