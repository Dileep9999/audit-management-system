import React, { useState, MouseEvent, ChangeEvent, KeyboardEvent } from "react";

import gallery from "@assets/images/gallery/img-02.jpg";

interface Comment {
  text: string;
}

interface Note {
  id: number;
  x: number;
  y: number;
  topPosition?: number;
  leftPosition?: number;
  visible: boolean;
  comments: Comment[];
}

const AnnotationImage: React.FC = () => {
  const [newComment, setNewComment] = useState<string>("");
  const [notes, setNotes] = useState<Note[]>([
    {
      id: Date.now(),
      x: 0,
      y: 0,
      visible: true,
      comments: [
        { text: "Beautiful Fabulous!" },
        { text: "Nice Awesome Photo!" },
      ],
    },
  ]);

  const addNote = (x: number, y: number) => {
    const hasVisibleNote = notes.find((n) => n.visible);

    // Hide existing visible note
    setNotes(notes.map((n) => ({ ...n, visible: false })));

    if (hasVisibleNote) return;

    setNotes([
      ...notes,
      {
        id: Date.now(),
        x,
        y,
        visible: true,
        comments: [],
      },
    ]);
  };

  const addComment = (noteId: number) => {
    if (!newComment.trim()) return;

    setNotes(
      notes.map((note) => {
        if (note.id === noteId) {
          return {
            ...note,
            comments: [...note.comments, { text: newComment }],
          };
        }
        return note;
      }),
    );

    setNewComment("");
  };

  const toggleNote = (noteId?: number) => {
    setNotes(
      notes.map((note) => ({
        ...note,
        visible: noteId ? note.id === noteId : false,
      })),
    );
  };

  const markerStyle = (note: Note) => ({
    top: `${note.topPosition}px`,
    left: `${note.leftPosition}px`,
  });

  const handleImageClick = (event: MouseEvent<HTMLImageElement>) => {
    const img = event.currentTarget.getBoundingClientRect();
    addNote(event.pageX - img.left, event.pageY - img.top);
  };

  return (
    <React.Fragment>
      <div className="card-body">
        <div className="relative">
          <img
            src={gallery}
            alt="Annotated"
            className="w-full rounded"
            onClick={handleImageClick}
          />

          <div className="absolute z-20 top-8 ltr:left-1/3 rtl:right-1/3">
            <div className="absolute top-0 z-0 bg-red-500 rounded-full ltr:right-0 rtl:left-0 size-5 animate-ping" />
            <button
              className="relative z-10 bg-red-500 border border-red-200 rounded-full shadow-smshadow-outline size-5"
              onClick={() =>
                setNotes(notes.map((note) => ({ ...note, visible: true })))
              }
            />

            {notes.map((note) => (
              <div
                key={note.id}
                className="absolute"
                style={markerStyle(note)}
                onClick={() => toggleNote(note.id)}
              >
                {note.visible && (
                  <div
                    className="relative z-10 flex flex-col w-48 gap-2 overflow-hidden bg-white divide-y divide-gray-200 rounded-smdark:divide-dark-800 dark:bg-dark-900"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {note.comments.map((comment, index) => (
                      <p key={index} className="px-4 pt-2">
                        {comment.text}
                      </p>
                    ))}
                    <input
                      value={newComment}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        setNewComment(e.target.value)
                      }
                      placeholder="Type comment"
                      className="rounded-none form-input first:pt-2"
                      onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
                        if (e.key === "Enter") {
                          addComment(note.id);
                          e.preventDefault();
                        }
                      }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        <p className="mt-2 text-sm italic text-gray-500 dark:text-dark-500">
          Add comments to the existing marker or click anywhere on the image to
          add new markers.
        </p>
      </div>
    </React.Fragment>
  );
};

export default AnnotationImage;
