# script.google.com

## [Google Apps Script - Restore Filtered Trashed Files](RestoreTrashedItems.gs)

This script is designed for use with Google Apps Script and helps restore trashed files from Google Drive based on a specified folder pattern and file type (PDF). The script processes all trashed files, restoring the ones that match the provided pattern and skipping the rest. It logs the processed files, indicating whether they were restored or skipped.

### Features

- Restores trashed files based on a specified folder pattern
- Restores PDF files regardless of their folder location
- Handles large numbers of files using continuation tokens
- Logs the status of each processed file (restored or skipped)

### Usage

1. Create a new Google Apps Script project
2. Copy the script provided in this repository and replace the regular expression in the PATTERN constant with the appropriate email address for your use case.
3. Save the project
4. Click on "Select function" in the toolbar and choose restoreFilteredTrashedFiles
5. Press the "Run" button (play icon) to execute the script

The script will start processing all trashed files in your Google Drive. It will restore files based on the specified pattern and PDF files regardless of their folder location. It will log the processed files, indicating whether they were restored or skipped.

You can view the logs by clicking on "View" in the toolbar and then selecting "Logs".

### Customization

You can customize the script by modifying the following constants:

- PATTERN: Change the regular expression to match your desired folder pattern. The provided pattern is generic and should be updated with the appropriate email address for your use case.
- TIME_LIMIT_MS: Adjust the time limit to avoid exceeding the maximum execution time. The default value is set to 4.9 minutes in milliseconds.

## [Google Apps Script - Manage Filtered Duplicate Files](ManageDriveDuplicates.gs)

ManageDriveDuplicates is a Google Apps Script for identifying and managing duplicate files in Google Drive. It works by scanning all files in the Drive and comparing their signatures (a combination of normalized filename and file size) against a list of known file signatures stored in a Google Sheet. If a duplicate is detected, the script decides which file to trash based on their last update dates and file paths.

### Features

- Duplicate Detection: The script scans all the files in your Google Drive and generates a unique signature for each file based on its normalized filename and size.
- File Comparison: It compares the generated file signature with a list of previously stored signatures in a Google Sheet. If a match is found, it identifies the file as a duplicate.
- Duplicate Management: On finding a duplicate, the script decides which file to move to the trash based on their last updated dates and file paths, preserving the most recent and relevant file.
- Continuation Token: The script uses a continuation token to remember its position between runs, ensuring it resumes from where it stopped in the previous run. This feature is particularly useful when dealing with large Google Drives, as the script may need to run multiple times due to Google Apps Script's maximum runtime limitation.

### Usage

#### Setup

- First, create a Google Sheet to store file signatures and note its ID from the URL. Define a regular expression pattern to specify the file paths you wish to check. Then, create a new Google Apps Script project and copy the ManageDriveDuplicates.gs script into it.

#### Execution

- Once the setup is done, run the manageDuplicateFilesInDrive function to start the process of identifying and managing duplicate files.

#### API Scopes

- Ensure that your project's API scopes include Google Drive and Google Sheets.

### Customization

The ManageDriveDuplicates.gs script includes several functions that you can customize according to your needs:

- manageDuplicateFilesInDrive: This is the main function which manages the duplicate files in your Google Drive.
- getFileSignaturesFromSheet: This function retrieves file signatures from the specified Google Sheet.
- saveFileSignaturesToSheet: This function saves the current file signatures to the Google Sheet.
- normalizeFileName: This function normalizes a filename by removing the 'Copy of' prefix and any numbers in parentheses.
- getFilePath: This function returns the full file path of a file.
- getDuplicateFile: This function retrieves the duplicate file object using the file ID.
- trashAppropriateFile: This function determines which file to trash based on their last updated dates and file paths.
