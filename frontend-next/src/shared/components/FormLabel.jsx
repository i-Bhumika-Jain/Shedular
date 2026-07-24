export default function FormLabel({ children, required = false }) {
  return (
    <span className="formLabelText">
      {children}
      {required ? (
        <span className="requiredStar" aria-label="required">
          *
        </span>
      ) : null}
    </span>
  );
}
