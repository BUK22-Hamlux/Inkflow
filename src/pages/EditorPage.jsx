import EditorLayout from "../layouts/EditorLayout";

const EditorPage = () => {
  return (
    <EditorLayout
      menuBar={
        <div className="h-full flex items-center px-4 text-text-secondary text-[13px]">
          <span>File</span> <span className="ml-4">Edit</span>{" "}
          <span className="ml-4">View</span>
        </div>
      }
      toolbar={
        <div className="h-full flex items-center px-4">
          <div className="text-text-secondary text-[13px]">Toolbar Tools</div>
        </div>
      }
      sidebar={null}
      canvas={
        <div className="w-198.5 max-w-full min-h-250 bg-editor shadow-editor rounded-sm my-10 mx-auto p-24 text-text-muted text-sm transition-all duration-theme">
          Editor Canvas
        </div>
      }
      statusBar={
        <div className="h-full flex items-center px-4 text-text-secondary text-xs">
          Words: 0 | Characters: 0
        </div>
      }
    />
  );
};

export default EditorPage;
