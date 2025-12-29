import logo from "@/assets/logo.png";

const LaunchOverlay = () => {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#2E1544] px-6">
      <img 
        src={logo} 
        alt="A la Gloria" 
        className="w-32 h-32 mb-8 object-contain"
      />
      <h1 className="text-[#E4B229] text-4xl md:text-6xl font-cinzel font-bold text-center mb-4">
        30/12/2025
      </h1>
      <p className="text-[#E4B229] text-xl md:text-2xl font-cinzel text-center">
        A la Gloria empieza mañana
      </p>
    </div>
  );
};

export default LaunchOverlay;
