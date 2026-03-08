import type { ReactNode } from "react";

type Props = {
  eyebrow: string;
  title: string;
  description?: string;
  actions?: ReactNode;
};

export default function PageHeader(props: Props) {
  return (
    <div className="page-header">
      <div>
        <div className="page-header__eyebrow">{props.eyebrow}</div>
        <h1 className="page-header__title">{props.title}</h1>
        {props.description ? (
          <p className="page-header__description">{props.description}</p>
        ) : null}
      </div>
      {props.actions}
    </div>
  );
}
