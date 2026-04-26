"use client";

import { useState } from "react";
import { FileIcon } from "lucide-react";
import {
  FileTree,
  FileTreeFolder,
  FileTreeFile,
} from "@/components/ai-elements/file-tree";
import {
  CodeBlock,
  CodeBlockHeader,
  CodeBlockTitle,
  CodeBlockFilename,
  CodeBlockActions,
  CodeBlockCopyButton,
} from "@/components/ai-elements/code-block";
import type { BundledLanguage } from "shiki";

export interface IDEFile {
  path: string;
  name: string;
  code: string;
  language: BundledLanguage;
}

export interface IDEFolder {
  name: string;
  path: string;
  children: (IDEFile | IDEFolder)[];
}

interface IDEPanelProps {
  files: IDEFile[];
  tree: (IDEFile | IDEFolder)[];
  defaultFile?: string;
}

function isFolder(item: IDEFile | IDEFolder): item is IDEFolder {
  return "children" in item;
}

function TreeItems({
  items,
}: {
  items: (IDEFile | IDEFolder)[];
}) {
  return (
    <>
      {items.map((item) =>
        isFolder(item) ? (
          <FileTreeFolder key={item.path} path={item.path} name={item.name}>
            <TreeItems items={item.children} />
          </FileTreeFolder>
        ) : (
          <FileTreeFile
            key={item.path}
            path={item.path}
            name={item.name}
            icon={<FileIcon className="size-4 text-muted-foreground" />}
          />
        )
      )}
    </>
  );
}

export default function IDEPanel({ files, tree, defaultFile }: IDEPanelProps) {
  const [selectedPath, setSelectedPath] = useState(
    defaultFile || files[0]?.path || ""
  );

  const activeFile = files.find((f) => f.path === selectedPath) || files[0];

  // Collect all folder paths for default expansion
  const allFolderPaths = new Set<string>();
  function collectFolders(items: (IDEFile | IDEFolder)[]) {
    for (const item of items) {
      if (isFolder(item)) {
        allFolderPaths.add(item.path);
        collectFolders(item.children);
      }
    }
  }
  collectFolders(tree);

  return (
    <div className="ide-panel overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 shadow-2xl bg-white dark:bg-gray-900">
      <div className="flex" style={{ minHeight: "420px" }}>
        {/* File tree sidebar */}
        <div className="w-56 shrink-0 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 overflow-y-auto">
          <FileTree
            selectedPath={selectedPath}
            onSelect={setSelectedPath}
            defaultExpanded={allFolderPaths}
            className="border-0 rounded-none bg-transparent text-xs"
          >
            <TreeItems items={tree} />
          </FileTree>
        </div>

        {/* Code viewer */}
        <div className="flex-1 min-w-0 flex flex-col">
          {activeFile && (
            <CodeBlock
              code={activeFile.code}
              language={activeFile.language}
              showLineNumbers
              className="border-0 rounded-none flex-1"
            >
              <CodeBlockHeader>
                <CodeBlockTitle>
                  <FileIcon size={14} />
                  <CodeBlockFilename>{activeFile.name}</CodeBlockFilename>
                </CodeBlockTitle>
                <CodeBlockActions>
                  <CodeBlockCopyButton />
                </CodeBlockActions>
              </CodeBlockHeader>
            </CodeBlock>
          )}
        </div>
      </div>
    </div>
  );
}
