"use client";
import NumeroAnimado from "./NumeroAnimado";

/** Mesma contagem na loja, árvores e ficha, com estado final acessível e imprimível. */
export default function CountingNumber({ value, className = "" }: { value: number; className?: string }) {
  return <span className={`tabular ${className}`}><NumeroAnimado valor={value} /></span>;
}
