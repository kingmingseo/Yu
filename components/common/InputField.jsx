export default function InputField({ label, type, placeholder, value, onChange }) {
  return (
    <div className="mb-4">
    <label htmlFor={label} className="block text-sm font-medium mb-1">
      {label}
    </label>
    <input
      id={label}
      type={type}
      className="w-full px-2 py-2 text-black focus:outline-none focus:border-black"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
    />
  </div>)}



    