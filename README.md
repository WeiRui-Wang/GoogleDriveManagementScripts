# script.google.com

## [Google Apps Script - Restore Filtered Trashed Files](restore_filtered_trashed_files.gs)

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
