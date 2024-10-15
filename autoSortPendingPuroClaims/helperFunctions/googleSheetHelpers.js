// Google Sheets helper functions
export const copyFirstSheetHeader = async (sheets, spreadsheetId) => {
    try {
        const sheetMetadata = await sheets.spreadsheets.get({ spreadsheetId });
        const firstSheet = sheetMetadata.data.sheets[0];
        const firstSheetName = firstSheet.properties.title;

        const headerResult = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: `${firstSheetName}!A1:Q1`,
        });
        return headerResult.data.values[0];
    } catch (error) {
        console.error('Error copying header row:', error);
        throw error;
    }
};

export const createNewSheetWithData = async (sheets, spreadsheetId, sheetName, headerRow, values) => {
    try {
        const newSheetResponse = await sheets.spreadsheets.batchUpdate({
            spreadsheetId,
            resource: { requests: [{ addSheet: { properties: { title: sheetName } } }] },
        });

        const newSheetId = newSheetResponse.data.replies[0].addSheet.properties.sheetId;

        await sheets.spreadsheets.values.update({
            spreadsheetId,
            range: `${sheetName}!A1:Q1`,
            valueInputOption: 'RAW',
            resource: { values: [headerRow] },
        });

        await sheets.spreadsheets.values.update({
            spreadsheetId,
            range: `${sheetName}!A2:B${values.length + 1}`,
            valueInputOption: 'RAW',
            resource: { values },
        });

        await copyHeaderFormatting(sheets, spreadsheetId, 0, newSheetId);
    } catch (error) {
        console.error('Error creating new sheet:', error);
        throw error;
    }
};

const copyHeaderFormatting = async (sheets, spreadsheetId, sourceSheetId, targetSheetId) => {
    const requests = [
        {
            copyPaste: {
                source: {
                    sheetId: sourceSheetId,
                    startRowIndex: 0,
                    endRowIndex: 1,
                },
                destination: {
                    sheetId: targetSheetId,
                    startRowIndex: 0,
                    endRowIndex: 1,
                },
                pasteType: 'PASTE_FORMAT',
            },
        },
    ];

    await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        resource: { requests },
    });
};