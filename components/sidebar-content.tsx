import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { NoteItem } from "./note-item";
import { Note } from "@/lib/types";
import { VList } from "virtua";

interface SidebarContentProps {
  groupedNotes: Record<string, Note[]>;
  selectedNoteSlug: string | null;
  onNoteSelect: (note: Note) => void;
  sessionId: string;
  handlePinToggle: (slug: string) => void;
  pinnedNotes: Set<string>;
  localSearchResults: Note[] | null;
  highlightedIndex: number;
  categoryOrder: string[];
  labels: Record<string, React.ReactNode>;
  handleNoteDelete: (note: Note) => Promise<void>;
  openSwipeItemSlug: string | null;
  setOpenSwipeItemSlug: React.Dispatch<React.SetStateAction<string | null>>;
  clearSearch: () => void;
  setSelectedNoteSlug: (slug: string | null) => void;
}

export function SidebarContent({
  groupedNotes,
  selectedNoteSlug,
  onNoteSelect,
  sessionId,
  handlePinToggle,
  pinnedNotes,
  localSearchResults,
  highlightedIndex,
  categoryOrder,
  labels,
  handleNoteDelete,
  openSwipeItemSlug,
  setOpenSwipeItemSlug,
  clearSearch,
  setSelectedNoteSlug,
}: SidebarContentProps) {
  const router = useRouter();

  const handlePinToggleWithClear = useCallback(
    (slug: string) => {
      clearSearch();
      handlePinToggle(slug);
    },
    [clearSearch, handlePinToggle]
  );

  const handleEdit = useCallback(
    (slug: string) => {
      clearSearch();
      router.push(`/notes/${slug}`);
      setSelectedNoteSlug(slug);
    },
    [clearSearch, router, setSelectedNoteSlug]
  );

  const handleDelete = useCallback(
    async (note: Note) => {
      clearSearch();
      await handleNoteDelete(note);
    },
    [clearSearch, handleNoteDelete]
  );

  const renderNormalContent = () => {
    const allItems: Array<{ type: 'header' | 'note', content: any, categoryKey?: string, index?: number }> = [];
    
    categoryOrder.forEach((categoryKey) => {
      if (groupedNotes[categoryKey] && groupedNotes[categoryKey].length > 0) {
        // Add header
        allItems.push({
          type: 'header',
          content: labels[categoryKey as keyof typeof labels],
          categoryKey
        });
        
        // Add notes
        groupedNotes[categoryKey].forEach((item: Note, index: number) => {
          allItems.push({
            type: 'note',
            content: item,
            categoryKey,
            index
          });
        });
      }
    });
    
    return (
      <VList style={{ height: "calc(100vh - 150px)" }}>
        {allItems.map((item, idx) => 
          item.type === 'header' ? (
            <h3 key={`header-${item.categoryKey}`} className="py-1 text-xs font-bold text-muted-foreground ml-2">
              {item.content}
            </h3>
          ) : (
            <ul key={`list-${item.categoryKey}-${item.content.id}`}>
              <NoteItem
                key={`note-${item.content.id}`}
                item={item.content}
                selectedNoteSlug={selectedNoteSlug}
                sessionId={sessionId}
                onNoteSelect={onNoteSelect}
                handlePinToggle={handlePinToggle}
                isPinned={pinnedNotes.has(item.content.slug)}
                isHighlighted={false}
                isSearching={false}
                handleNoteDelete={handleNoteDelete}
                onNoteEdit={handleEdit}
                openSwipeItemSlug={openSwipeItemSlug}
                setOpenSwipeItemSlug={setOpenSwipeItemSlug}
                showDivider={item.index! < groupedNotes[item.categoryKey!].length - 1}
              />
            </ul>
          )
        )}
      </VList>
    );
  };

  return (
    <div className="py-2">
      {localSearchResults === null ? (
        <nav>
          {renderNormalContent()}
        </nav>
      ) : localSearchResults.length > 0 ? (
        <VList style={{ height: "calc(100vh - 150px)" }}>
          <ul>
            {localSearchResults.map((item: Note, index: number) => (
              <NoteItem
                key={item.id}
                item={item}
                selectedNoteSlug={selectedNoteSlug}
                sessionId={sessionId}
                onNoteSelect={onNoteSelect}
                handlePinToggle={handlePinToggleWithClear}
                isPinned={pinnedNotes.has(item.slug)}
                isHighlighted={index === highlightedIndex}
                isSearching={true}
                handleNoteDelete={handleDelete}
                onNoteEdit={handleEdit}
                openSwipeItemSlug={openSwipeItemSlug}
                setOpenSwipeItemSlug={setOpenSwipeItemSlug}
                showDivider={index < localSearchResults.length - 1}
              />
            ))}
          </ul>
        </VList>
      ) : (
        <p className="text-sm text-muted-foreground px-2 mt-4">No results found</p>
      )}
    </div>
  );
}
