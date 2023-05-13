// Define constants
const MAX_EXECUTION_TIME_MS = 294000; // Maximum execution time in milliseconds
const SCRIPT_PROPERTIES = PropertiesService.getScriptProperties();
const SCRIPT_START_MESSAGE = "Script started. Scanning for empty folders...";
const SCRIPT_END_MESSAGE = "Script finished. Total empty folders deleted: ";
const TIMEOUT_MESSAGE = "Execution time limit reached. Deleted ";

/**
 * Main function to delete all empty folders in Google Drive.
 */
function deleteEmptyFolders() {
  // Retrieve the continuation token from the script properties, if it exists
  const continuationToken = SCRIPT_PROPERTIES.getProperty("CONTINUATION_TOKEN");

  // If a continuation token exists, continue the folder iteration from where it left off
  // If not, start a new folder iteration from the beginning
  const allFolders = continuationToken
    ? DriveApp.continueFolderIterator(continuationToken)
    : DriveApp.getFolders();

  // Log start of script execution
  Logger.log(SCRIPT_START_MESSAGE);

  // Initialize a counter to keep track of the number of deleted folders
  let deletedFoldersCount = 0;

  // Record the start time of the script
  const startTime = new Date();

  // Process each folder in the iteration
  while (allFolders.hasNext()) {
    // Check if script execution time has exceeded the max execution time
    if (new Date() - startTime > MAX_EXECUTION_TIME_MS) {
      // If execution time limit is reached, save the continuation token to script properties
      SCRIPT_PROPERTIES.setProperty(
        "CONTINUATION_TOKEN",
        allFolders.getContinuationToken()
      );

      // Log the timeout and the saved continuation token
      Logger.log(
        TIMEOUT_MESSAGE +
          deletedFoldersCount +
          " folder(s) this run. Continuation token saved."
      );

      // Exit the script
      return;
    }

    // Get the next folder in the iteration
    const folder = allFolders.next();

    // Check if the current folder is empty
    if (isFolderEmpty(folder)) {
      // If the folder is empty, move it to trash
      folder.setTrashed(true);

      // Log the deletion
      Logger.log(
        `Deleted empty folder: ${folder.getName()} (ID: ${folder.getId()})`
      );

      // Increment the deletion counter
      deletedFoldersCount++;
    }
  }

  // If all folders have been processed, delete the continuation token from script properties
  SCRIPT_PROPERTIES.deleteProperty("CONTINUATION_TOKEN");

  // Log the end of the script execution
  Logger.log(SCRIPT_END_MESSAGE + deletedFoldersCount);
}

/**
 * Function to check if a given folder is empty.
 * A folder is considered empty if it contains no files and no sub-folders.
 *
 * @param {Folder} folder - The folder to check.
 * @return {boolean} - Returns true if the folder is empty, false otherwise.
 */
function isFolderEmpty(folder) {
  // Get all files and sub-folders in the given folder
  const files = folder.getFiles();
  const subFolders = folder.getFolders();

  // Return true if the folder contains no files and no sub-folders, false otherwise
  return !files.hasNext() && !subFolders.hasNext();
}
