const EditorLayout = ({ menuBar, toolbar, sidebar, canvas, statusBar }) => {
  return (
    <div className="flex flex-col h-screen w-full bg-app overflow-hidden transition-all duration-theme">
      <header className="h-10 shrink-0 bg-toolbar border-b border-border-toolbar shadow-toolbar z-10 overflow-hidden">
        {menuBar}
      </header>

      <nav className="h-13 shrink-0 bg-toolbar border-b border-border-toolbar z-50">
        {toolbar}
      </nav>

      <main className="flex-1 flex overflow-hidden relative">
        {sidebar && (
          <aside className="w-64 shrink-0 border-r border-border-toolbar bg-sidebar overflow-y-auto">
            {sidebar}
          </aside>
        )}

        <section className="flex-1 overflow-y-auto bg-app flex flex-col items-center custom-scrollbar">
          {canvas}
        </section>
      </main>

      <footer className="h-8 shrink-0 bg-toolbar border-t border-border-toolbar z-50 overflow-hidden">
        {statusBar}
      </footer>
    </div>
  );
};

export default EditorLayout;
