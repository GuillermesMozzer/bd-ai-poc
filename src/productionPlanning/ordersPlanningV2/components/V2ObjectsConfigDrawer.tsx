import {
  Add as AddIcon,
  Close as CloseIcon,
  Delete as DeleteIcon,
  SubdirectoryArrowRight as ChildIcon,
} from '@mui/icons-material';
import {
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
  Popover,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import {useRef, useState} from 'react';
import type {V2ObjectCategoryConfig} from '../types';

const PRESET_COLORS = [
  '#2563EB', '#F59E0B', '#10B981', '#DC2626', '#8B5CF6',
  '#b910ae', '#0EA5E9', '#F97316', '#14B8A6', '#6366F1',
  '#84CC16', '#EC4899',
];

function generateId() {
  return `obj-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

function pickNextColor(categories: V2ObjectCategoryConfig[]): string {
  const used = new Set(categories.flatMap((c) => [c.color, ...(c.children?.map((ch) => ch.color) ?? [])]));
  return PRESET_COLORS.find((c) => !used.has(c)) ?? PRESET_COLORS[Math.floor(Math.random() * PRESET_COLORS.length)];
}

type ColorPickerProps = {
  color: string;
  onChange: (color: string) => void;
};

function ColorDot({color, onChange}: ColorPickerProps) {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);

  return (
    <>
      <Box
        onClick={(e) => setAnchor(e.currentTarget)}
        sx={{
          width: 16,
          height: 16,
          borderRadius: '50%',
          bgcolor: color,
          cursor: 'pointer',
          flexShrink: 0,
          border: '2px solid rgba(0,0,0,0.1)',
          '&:hover': {transform: 'scale(1.2)'},
          transition: 'transform 0.15s',
        }}
      />
      <Popover
        open={Boolean(anchor)}
        anchorEl={anchor}
        onClose={() => setAnchor(null)}
        anchorOrigin={{vertical: 'bottom', horizontal: 'left'}}
      >
        <Box sx={{p: 1.2}}>
          <Box sx={{display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 0.7}}>
            {PRESET_COLORS.map((c) => (
              <Box
                key={c}
                onClick={() => {onChange(c); setAnchor(null);}}
                sx={{
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  bgcolor: c,
                  cursor: 'pointer',
                  border: c === color ? '2px solid #08184A' : '2px solid transparent',
                  '&:hover': {transform: 'scale(1.15)'},
                  transition: 'transform 0.1s',
                }}
              />
            ))}
          </Box>
        </Box>
      </Popover>
    </>
  );
}

type EditableRowProps = {
  item: V2ObjectCategoryConfig;
  onUpdate: (updated: V2ObjectCategoryConfig) => void;
  onDelete: () => void;
  onAddChild?: () => void;
  indent?: boolean;
};

function EditableRow({item, onUpdate, onDelete, onAddChild, indent = false}: EditableRowProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(item.label);
  const inputRef = useRef<HTMLInputElement>(null);

  const commitEdit = () => {
    setEditing(false);
    const trimmed = draft.trim();
    if (trimmed && trimmed !== item.label) {
      onUpdate({...item, label: trimmed});
    } else {
      setDraft(item.label);
    }
  };

  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={1}
      sx={{
        px: 1.5,
        py: 0.8,
        pl: indent ? 3.5 : 1.5,
        borderRadius: 1.5,
        '&:hover': {bgcolor: 'var(--planning-surface-muted)'},
        transition: 'background 0.1s',
      }}
    >
      {indent && (
        <ChildIcon sx={{fontSize: 14, color: '#CBD5E1', flexShrink: 0, ml: -1}} />
      )}

      <ColorDot
        color={item.color}
        onChange={(c) => onUpdate({...item, color: c})}
      />

      {editing ? (
        <TextField
          inputRef={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commitEdit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commitEdit();
            if (e.key === 'Escape') {setDraft(item.label); setEditing(false);}
          }}
          size="small"
          autoFocus
          sx={{
            flex: 1,
            '& .MuiInputBase-input': {fontSize: 12, py: 0.4, px: 0.8},
            '& .MuiOutlinedInput-root': {borderRadius: 1},
          }}
        />
      ) : (
        <Typography
          onClick={() => {setEditing(true); setTimeout(() => inputRef.current?.select(), 10);}}
          sx={{
            flex: 1,
            fontSize: 12,
            fontWeight: 600,
            color: '#08184A',
            cursor: 'text',
            borderRadius: 1,
            px: 0.5,
            py: 0.3,
            '&:hover': {bgcolor: 'var(--planning-ai-accent-bg)', color: '#4338CA'},
            transition: 'all 0.1s',
            userSelect: 'none',
          }}
        >
          {item.label}
        </Typography>
      )}

      {onAddChild && (
        <Tooltip title="Add child object">
          <IconButton
            size="small"
            onClick={onAddChild}
            sx={{color: '#8B95B5', '&:hover': {color: '#4338CA', bgcolor: 'var(--planning-ai-accent-bg)'}, p: 0.4}}
          >
            <AddIcon sx={{fontSize: 14}} />
          </IconButton>
        </Tooltip>
      )}

      <Tooltip title="Delete">
        <IconButton
          size="small"
          onClick={onDelete}
          sx={{color: '#8B95B5', '&:hover': {color: '#DC2626', bgcolor: '#FEF2F2'}, p: 0.4}}
        >
          <DeleteIcon sx={{fontSize: 14}} />
        </IconButton>
      </Tooltip>
    </Stack>
  );
}

type Props = {
  open: boolean;
  onClose: () => void;
  categories: V2ObjectCategoryConfig[];
  onChange: (categories: V2ObjectCategoryConfig[]) => void;
};

export default function V2ObjectsConfigDrawer({open, onClose, categories, onChange}: Props) {
  const updateParent = (id: string, updated: V2ObjectCategoryConfig) => {
    onChange(categories.map((c) => (c.id === id ? updated : c)));
  };

  const deleteParent = (id: string) => {
    onChange(categories.filter((c) => c.id !== id));
  };

  const addChild = (parentId: string) => {
    const parent = categories.find((c) => c.id === parentId);
    if (!parent) return;
    const newChild: V2ObjectCategoryConfig = {
      id: generateId(),
      label: 'New Sub-object',
      color: pickNextColor(categories),
      enabled: true,
    };
    onChange(
      categories.map((c) =>
        c.id === parentId ? {...c, children: [...(c.children ?? []), newChild]} : c,
      ),
    );
  };

  const updateChild = (parentId: string, childId: string, updated: V2ObjectCategoryConfig) => {
    onChange(
      categories.map((c) =>
        c.id === parentId
          ? {...c, children: (c.children ?? []).map((ch) => (ch.id === childId ? updated : ch))}
          : c,
      ),
    );
  };

  const deleteChild = (parentId: string, childId: string) => {
    onChange(
      categories.map((c) =>
        c.id === parentId
          ? {...c, children: (c.children ?? []).filter((ch) => ch.id !== childId)}
          : c,
      ),
    );
  };

  const addObject = () => {
    const newCat: V2ObjectCategoryConfig = {
      id: generateId(),
      label: 'New Object',
      color: pickNextColor(categories),
      enabled: true,
    };
    onChange([...categories, newCat]);
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{sx: {width: 360, display: 'flex', flexDirection: 'column'}}}
    >
      {/* Header */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{px: 2, py: 1.5, borderBottom: '1px solid var(--planning-border)', flexShrink: 0}}
      >
        <Box>
          <Typography sx={{fontSize: 15, fontWeight: 900, color: '#08184A'}}>Configure Objects</Typography>
          <Typography sx={{fontSize: 11.5, color: '#8B95B5', mt: 0.2}}>
            Create, rename, recolor or organize objects and sub-objects
          </Typography>
        </Box>
        <IconButton size="small" onClick={onClose} sx={{color: '#8B95B5'}}>
          <CloseIcon sx={{fontSize: 18}} />
        </IconButton>
      </Stack>

      {/* Add object button */}
      <Box sx={{px: 2, py: 1.2, borderBottom: '1px solid var(--planning-border)', flexShrink: 0}}>
        <Button
          startIcon={<AddIcon sx={{fontSize: 15}} />}
          onClick={addObject}
          size="small"
          variant="outlined"
          sx={{
            textTransform: 'none',
            fontWeight: 700,
            fontSize: 12,
            borderColor: '#E3E8F2',
            color: '#5B668A',
            borderRadius: 1.5,
            '&:hover': {borderColor: '#4338CA', color: '#4338CA', bgcolor: 'var(--planning-ai-accent-bg)'},
          }}
        >
          Add Object
        </Button>
      </Box>

      {/* List */}
      <Box sx={{flex: 1, overflowY: 'auto', py: 1}}>
        {categories.map((cat, idx) => (
          <Box key={cat.id}>
            <EditableRow
              item={cat}
              onUpdate={(updated) => updateParent(cat.id, updated)}
              onDelete={() => deleteParent(cat.id)}
              onAddChild={() => addChild(cat.id)}
            />
            {(cat.children ?? []).map((child) => (
              <EditableRow
                key={child.id}
                item={child}
                indent
                onUpdate={(updated) => updateChild(cat.id, child.id, updated)}
                onDelete={() => deleteChild(cat.id, child.id)}
              />
            ))}
            {idx < categories.length - 1 && (
              <Divider sx={{mx: 1.5, my: 0.5, borderColor: '#F1F5F9'}} />
            )}
          </Box>
        ))}
      </Box>

      {/* Footer hint */}
      <Box sx={{px: 2, py: 1.2, borderTop: '1px solid #E3E8F2', flexShrink: 0}}>
        <Typography sx={{fontSize: 11, color: '#8B95B5'}}>
          Click a name to rename · Click the dot to change color
        </Typography>
      </Box>
    </Drawer>
  );
}
