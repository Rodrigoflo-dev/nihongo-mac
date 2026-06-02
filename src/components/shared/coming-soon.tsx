import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

interface ComingSoonProps {
  title: string;
  description: string;
  jp?: string;
}

export function ComingSoon({ title, description, jp }: ComingSoonProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mx-auto max-w-xl"
    >
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Sparkles className="size-5" />
          </div>
          {jp ? (
            <p className="font-jp text-xs tracking-[0.3em] text-muted-foreground">
              {jp}
            </p>
          ) : null}
          <h2 className="text-xl font-semibold">{title}</h2>
          <p className="max-w-md text-balance text-sm text-muted-foreground">
            {description}
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
