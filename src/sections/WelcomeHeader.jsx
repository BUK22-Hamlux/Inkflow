import inkflow_logo from "../assets/inkflow_logo.png";

const WelcomeHeader = () => {
  return (
    <header className="flex flex-col items-center text-center mb-10">
      <div className="mb-4 w-12 h-auto flex items-center">
        <img src={inkflow_logo} alt="inkflow_logo" />
      </div>
      <h1 className="text-3xl font-bold text-text-primary tracking-tight mb-3">
        InkFlow
      </h1>
      <p className="text-base text-text-secondary max-w-sm leading-relaxed">
        A clean, focused writing experience. Create something great today.
      </p>
    </header>
  );
};

export default WelcomeHeader;
