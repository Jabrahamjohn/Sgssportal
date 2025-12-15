import { CloudUploadOutlined } from '@ant-design/icons';
import { Upload as AntdUpload, type UploadFile, type UploadProps } from 'antd';
import React from 'react';

import Button from './button';

export type UploadType = UploadProps & {
  error?: string;
  placeholder?: string;
};

export type UploadFileType = UploadFile;

function Upload({ children, error, placeholder = 'Upload', ...props }: UploadType) {
  const [fileList, setFileList] = React.useState<UploadFileType[]>([]);

  return (
    <>
      <AntdUpload
        beforeUpload={(file) => {
          setFileList([...fileList, file]);

          return false;
        }}
        fileList={fileList}
        onRemove={(file) => {
          const index = fileList.indexOf(file);
          const newFileList = fileList.slice();
          newFileList.splice(index, 1);
          setFileList(newFileList);
        }}
        {...props}
      >
        {children || (
          <Button icon={CloudUploadOutlined} htmlType="button" variant="default">
            {placeholder}
          </Button>
        )}
      </AntdUpload>
      {error && <span className="block !text-red-500 form-field-label">{error}</span>}
    </>
  );
}

export function UploadDragger({ error, ...props }: UploadType) {
  return (
    <>
      <AntdUpload.Dragger {...props} />
      {error && <span className="block !text-red-500 form-field-label">{error}</span>}
    </>
  );
}

Upload.Dragger = AntdUpload.Dragger;

export default Upload;
