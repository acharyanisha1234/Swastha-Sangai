import { motion } from "framer-motion";
import React, { Children, isValidElement } from "react";

export default function TypeWriter({ children, className = "", speed = 0.05, pause = 2 }) {
  const items = [];

  Children.forEach(children, (child) => {
    if (typeof child === "string") {
      child.split("").forEach((char) => items.push(char));
    } else if (isValidElement(child)) {
      items.push(child);
    }
  });

  return (
    <span className={`inline-block ${className}`}>
      {items.map((item, index) => (
        <motion.span
          key={index}
          initial={{ opacity: 0, y: "0.25em" }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{
            delay: index * speed,
            duration: items.length * speed + pause,
            repeat: Infinity,
            repeatType: "loop",
          }}
        >
          {item}
        </motion.span>
      ))}
    </span>
  );
}
