import EditorLayout from "../layouts/EditorLayout";
import EditorCanvas from "../components/Editor/EditorCanvas";

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
      canvas={<EditorCanvas />}
      statusBar={
        <div className="h-full flex items-center px-4 text-text-secondary text-xs">
          Words: 0 | Characters: 0
        </div>
      }
    />
  );
};

export default EditorPage;
