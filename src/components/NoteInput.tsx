type Props = {
  note: string;

setNote:
React.Dispatch<React.SetStateAction<string>>;
};

export default function NoteInput({ note, setNote}: Props) {

  return (
    <textarea
      value={note}
      onChange={(e) => setNote(e.target.value)}
      className="w-full border p-2"
      placeholder="このイベントのメモを記入"
    />
  );
}
