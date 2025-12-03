import React from 'react';
import type { AdminViewServerProps } from 'payload';

const StaffProvider = (props: AdminViewServerProps & { children?: React.ReactNode }) => {
  const role = (props as any)?.user?.role ?? (props as any)?.payload?.user?.role;

  return (
    <>
      {role === 'staff' ? (
        <style>{`
          .nav__toggle, [data-element="nav-toggle"] {
            display: none !important;
          }
        `}</style>
      ) : null}
      {props.children}
    </>
  );
};

export default StaffProvider;
