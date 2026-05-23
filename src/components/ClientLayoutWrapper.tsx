"use client";

type ClientLayoutWrapperProps = {
  children: React.ReactNode;
}

export default function ClientLayoutWrapper ({
  children,
}: ClientLayoutWrapperProps) {
  return<>{children}</>;
}