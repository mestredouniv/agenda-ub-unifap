import { UnifapHeader } from "@/components/UnifapHeader";
import { NavigationBar } from "@/components/NavigationBar";

const Home = () => {
  return (
    <div className="container mx-auto p-6">
      <UnifapHeader />
      <NavigationBar />
    </div>
  );
};

export default Home;