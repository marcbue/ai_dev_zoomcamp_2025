import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

const NotFound = () => {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
      <div className="text-center arcade-border bg-card rounded-lg p-8 max-w-md">
        <h1 className="text-6xl font-display font-bold text-destructive text-glow-pink mb-4">
          404
        </h1>
        <p className="text-xl text-primary mb-2">GAME NOT FOUND</p>
        <p className="text-muted-foreground text-sm mb-8">
          The page you're looking for doesn't exist in this dimension.
        </p>
        <Link to="/">
          <Button className="box-glow">
            <Home className="w-4 h-4 mr-2" />
            Return Home
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
