import React from 'react';
import { useAlertContext } from '~/store/contexts';

/**
 * useViewDownloadFile
 *
 * A custom hook that provides two main functionalities for a single file:
 * - View the file in a new browser tab
 * - Download the file to local storage
 *
 * @param fileName - Optional. Name to give the downloaded file (default: "download")
 * @param url - The secure URL to the file
 * @param token - Bearer token used for authorization
 */
export default function useViewDownloadFile({
  fileName = 'download',
  url: fileUrl,
  token,
}: {
  fileName?: string;
  url: string;
  token: string;
}) {
  const alert = useAlertContext();

  const [downloading, setDownloading] = React.useState(false);
  const [viewLoading, setViewLoading] = React.useState(false);

  /**
   * Initiates the download of a file using a GET request and Blob conversion.
   */
  const downloadFile = React.useCallback(async () => {
    try {
      setDownloading(true);
      const response = await fetch(fileUrl, {
        method: 'GET',
        headers: {
          Authorization: 'Bearer ' + token,
        },
      });

      if (!response.ok) {
        throw new Error('Error Getting Document');
      }

      // Convert the response into a Blob and create a downloadable URL
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      // Trigger browser download via anchor element
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();

      // Cleanup
      link.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      alert.open({
        type: 'error',
        message: (error as any).message || 'Error Downloading Document',
      });
    } finally {
      setDownloading(false);
    }
  }, [alert, token, fileUrl, fileName]);

  /**
   * Opens the file in a new browser tab for viewing.
   */
  const viewFile = React.useCallback(async () => {
    try {
      setViewLoading(true);
      const response = await fetch(fileUrl, {
        method: 'GET',
        headers: {
          Authorization: 'Bearer ' + token,
        },
      });

      if (!response.ok) {
        throw new Error('Error Getting Document');
      }

      // Create a URL from Blob and open in new tab
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch (error) {
      alert.open({
        type: 'error',
        message: (error as any).message || 'Error Viewing Document',
      });
    } finally {
      setViewLoading(false);
    }
  }, [alert, token, fileUrl]);

  return { view: viewFile, download: downloadFile, downloading, viewLoading };
}

/**
 * useExternalViewDownloadFile
 *
 * A reusable hook for viewing/downloading *external* file URLs where
 * the URL and file name can be passed dynamically at call time.
 *
 * @param token - Bearer token for authentication
 */
export function useExternalViewDownloadFile({ token }: { token: string }) {
  const alert = useAlertContext();

  const [downloading, setDownloading] = React.useState(false);
  const [viewLoading, setViewLoading] = React.useState(false);

  /**
   * Downloads a file from a dynamic URL with optional custom file name.
   *
   * @param fileUrl - Fully qualified file URL
   * @param fileName - Optional name to save the file as
   */
  const downloadFile = React.useCallback(
    async (fileUrl: string, fileName: string = 'File') => {
      try {
        setDownloading(true);
        const response = await fetch(fileUrl, {
          method: 'GET',
          headers: {
            Authorization: 'Bearer ' + token,
          },
        });

        if (!response.ok) {
          throw new Error('Error Getting Document');
        }

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();

        link.remove();
        URL.revokeObjectURL(url);
      } catch (error) {
        alert.open({
          type: 'error',
          message: (error as any).message || 'Error Viewing Document',
        });
      } finally {
        setDownloading(false);
      }
    },
    [alert, token]
  );

  /**
   * Opens a file from a dynamic URL in a new browser tab.
   *
   * @param fileUrl - Fully qualified file URL
   */
  const viewFile = React.useCallback(
    async (fileUrl: string) => {
      try {
        setViewLoading(true);
        const response = await fetch(fileUrl, {
          method: 'GET',
          headers: {
            Authorization: 'Bearer ' + token,
          },
        });

        if (!response.ok) {
          throw new Error('Error Getting Document');
        }

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
      } catch (error) {
        alert.open({
          type: 'error',
          message: (error as any).message || 'Error Viewing Document',
        });
      } finally {
        setViewLoading(false);
      }
    },
    [alert, token]
  );

  return { view: viewFile, download: downloadFile, downloading, viewLoading };
}
