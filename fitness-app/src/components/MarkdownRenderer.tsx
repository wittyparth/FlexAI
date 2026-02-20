/**
 * MarkdownRenderer.tsx
 *
 * Production-quality markdown renderer for React Native.
 * Supports: bold, italic, code (inline + block), headers (h1-h3),
 * bullet lists, numbered lists, blockquotes, tables, and plain text paragraphs.
 *
 * No external dependencies — pure React Native Text/View.
 */

import React, { memo, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Clipboard } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface MarkdownRendererProps {
    content: string;
    textColor: string;
    mutedColor: string;
    codeBackground: string;
    codeBorder: string;
    primaryColor: string;
    fontSize?: number;
    lineHeight?: number;
}

// ─── Token Types ─────────────────────────────────────────────────────────────

type InlineToken =
    | { type: 'text'; value: string }
    | { type: 'bold'; value: string }
    | { type: 'italic'; value: string }
    | { type: 'bolditalic'; value: string }
    | { type: 'code'; value: string }
    | { type: 'strikethrough'; value: string };

type BlockToken =
    | { type: 'h1'; content: string }
    | { type: 'h2'; content: string }
    | { type: 'h3'; content: string }
    | { type: 'paragraph'; content: string }
    | { type: 'codeblock'; content: string; language?: string }
    | { type: 'bullet'; content: string; depth: number }
    | { type: 'ordered'; content: string; index: number }
    | { type: 'blockquote'; content: string }
    | { type: 'table'; headers: string[]; rows: string[][] }
    | { type: 'divider' }
    | { type: 'empty' };

// ─── Inline Parser ────────────────────────────────────────────────────────────

function parseInline(text: string): InlineToken[] {
    const tokens: InlineToken[] = [];
    const regex = /(\*\*\*(.+?)\*\*\*|\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`|~~(.+?)~~)/gs;
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(text)) !== null) {
        if (match.index > lastIndex) {
            tokens.push({ type: 'text', value: text.slice(lastIndex, match.index) });
        }
        if (match[2] !== undefined) {
            tokens.push({ type: 'bolditalic', value: match[2] });
        } else if (match[3] !== undefined) {
            tokens.push({ type: 'bold', value: match[3] });
        } else if (match[4] !== undefined) {
            tokens.push({ type: 'italic', value: match[4] });
        } else if (match[5] !== undefined) {
            tokens.push({ type: 'code', value: match[5] });
        } else if (match[6] !== undefined) {
            tokens.push({ type: 'strikethrough', value: match[6] });
        }
        lastIndex = match.index + match[0].length;
    }

    if (lastIndex < text.length) {
        tokens.push({ type: 'text', value: text.slice(lastIndex) });
    }

    return tokens.length > 0 ? tokens : [{ type: 'text', value: text }];
}

// ─── Table Parser ─────────────────────────────────────────────────────────────

function isTableRow(line: string): boolean {
    return line.trim().startsWith('|') && line.trim().endsWith('|');
}

function parseTableRow(line: string): string[] {
    return line
        .trim()
        .slice(1, -1)
        .split('|')
        .map((cell) => cell.trim());
}

function isSeparatorRow(line: string): boolean {
    return isTableRow(line) && /^\|[\s|:-]+\|$/.test(line.trim());
}

// ─── Block Parser ─────────────────────────────────────────────────────────────

function parseBlocks(markdown: string): BlockToken[] {
    const lines = markdown.split('\n');
    const blocks: BlockToken[] = [];
    let i = 0;
    let orderedIndex = 1;

    while (i < lines.length) {
        const line = lines[i];

        // Code block
        if (line.startsWith('```')) {
            const lang = line.slice(3).trim();
            const codeLines: string[] = [];
            i++;
            while (i < lines.length && !lines[i].startsWith('```')) {
                codeLines.push(lines[i]);
                i++;
            }
            blocks.push({ type: 'codeblock', content: codeLines.join('\n'), language: lang || undefined });
            i++;
            continue;
        }

        // Horizontal rule
        if (/^[-*_]{3,}$/.test(line.trim())) {
            blocks.push({ type: 'divider' });
            i++;
            continue;
        }

        // H1
        if (line.startsWith('# ')) {
            blocks.push({ type: 'h1', content: line.slice(2) });
            i++;
            continue;
        }

        // H2
        if (line.startsWith('## ')) {
            blocks.push({ type: 'h2', content: line.slice(3) });
            i++;
            continue;
        }

        // H3
        if (line.startsWith('### ')) {
            blocks.push({ type: 'h3', content: line.slice(4) });
            i++;
            continue;
        }

        // Blockquote
        if (line.startsWith('> ')) {
            blocks.push({ type: 'blockquote', content: line.slice(2) });
            i++;
            continue;
        }

        // Table detection
        if (isTableRow(line) && i + 1 < lines.length && isSeparatorRow(lines[i + 1])) {
            const headers = parseTableRow(line);
            i += 2; // skip header + separator
            const rows: string[][] = [];
            while (i < lines.length && isTableRow(lines[i])) {
                rows.push(parseTableRow(lines[i]));
                i++;
            }
            blocks.push({ type: 'table', headers, rows });
            continue;
        }

        // Bullet list (-, *, +)
        const bulletMatch = line.match(/^(\s*)[*\-+]\s+(.+)/);
        if (bulletMatch) {
            const depth = Math.floor(bulletMatch[1].length / 2);
            blocks.push({ type: 'bullet', content: bulletMatch[2], depth });
            orderedIndex = 1;
            i++;
            continue;
        }

        // Ordered list
        const orderedMatch = line.match(/^(\s*)(\d+)\.\s+(.+)/);
        if (orderedMatch) {
            blocks.push({ type: 'ordered', content: orderedMatch[3], index: orderedIndex++ });
            i++;
            continue;
        }

        // Empty line
        if (line.trim() === '') {
            if (blocks.length > 0 && blocks[blocks.length - 1].type !== 'empty') {
                blocks.push({ type: 'empty' });
            }
            i++;
            orderedIndex = 1;
            continue;
        }

        // Paragraph
        blocks.push({ type: 'paragraph', content: line });
        i++;
    }

    return blocks;
}

// ─── Inline Renderer ──────────────────────────────────────────────────────────

interface InlineProps {
    tokens: InlineToken[];
    textColor: string;
    codeBackground: string;
    codeBorder: string;
    fontSize: number;
    lineHeight: number;
    fontWeight?: 'normal' | 'bold' | '400' | '500' | '600' | '700';
}

const InlineContent = memo(({
    tokens,
    textColor,
    codeBackground,
    codeBorder,
    fontSize,
    lineHeight,
    fontWeight = 'normal',
}: InlineProps) => (
    <Text>
        {tokens.map((token, idx) => {
            switch (token.type) {
                case 'bolditalic':
                    return (
                        <Text key={idx} style={{ fontWeight: '700', fontStyle: 'italic', color: textColor, fontSize, lineHeight }}>
                            {token.value}
                        </Text>
                    );
                case 'bold':
                    return (
                        <Text key={idx} style={{ fontWeight: '700', color: textColor, fontSize, lineHeight }}>
                            {token.value}
                        </Text>
                    );
                case 'italic':
                    return (
                        <Text key={idx} style={{ fontStyle: 'italic', color: textColor, fontSize, lineHeight }}>
                            {token.value}
                        </Text>
                    );
                case 'code':
                    return (
                        <Text
                            key={idx}
                            style={{
                                fontFamily: 'monospace',
                                fontSize: fontSize - 1,
                                backgroundColor: codeBackground,
                                color: '#E879F9',
                                borderRadius: 4,
                                paddingHorizontal: 4,
                            }}
                        >
                            {` ${token.value} `}
                        </Text>
                    );
                case 'strikethrough':
                    return (
                        <Text key={idx} style={{ textDecorationLine: 'line-through', color: textColor, fontSize, lineHeight }}>
                            {token.value}
                        </Text>
                    );
                default:
                    return (
                        <Text key={idx} style={{ color: textColor, fontSize, lineHeight, fontWeight }}>
                            {token.value}
                        </Text>
                    );
            }
        })}
    </Text>
));

// ─── Code Block ───────────────────────────────────────────────────────────────

interface CodeBlockProps {
    content: string;
    language?: string;
    codeBackground: string;
    codeBorder: string;
    mutedColor: string;
}

const CodeBlock = memo(({ content, language, codeBackground, codeBorder, mutedColor }: CodeBlockProps) => {
    const handleCopy = useCallback(() => {
        Clipboard.setString(content);
        Alert.alert('Copied', 'Code copied to clipboard');
    }, [content]);

    return (
        <View style={[codeStyles.container, { backgroundColor: codeBackground, borderColor: codeBorder }]}>
            <View style={codeStyles.header}>
                <Text style={[codeStyles.langLabel, { color: mutedColor }]}>
                    {language ? language.toUpperCase() : 'CODE'}
                </Text>
                <TouchableOpacity onPress={handleCopy} style={codeStyles.copyBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Ionicons name="copy-outline" size={14} color={mutedColor} />
                    <Text style={[codeStyles.copyText, { color: mutedColor }]}>Copy</Text>
                </TouchableOpacity>
            </View>
            <View style={[codeStyles.dividerLine, { backgroundColor: codeBorder }]} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={codeStyles.scroll}>
                <Text style={codeStyles.codeText}>{content}</Text>
            </ScrollView>
        </View>
    );
});

const codeStyles = StyleSheet.create({
    container: {
        borderRadius: 12,
        borderWidth: 1,
        marginVertical: 8,
        overflow: 'hidden',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 14,
        paddingVertical: 8,
    },
    langLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 0.8 },
    copyBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    copyText: { fontSize: 11, fontWeight: '600' },
    dividerLine: { height: StyleSheet.hairlineWidth },
    scroll: { padding: 14 },
    codeText: {
        fontFamily: 'monospace',
        fontSize: 13,
        lineHeight: 20,
        color: '#E2E8F0',
    },
});

// ─── Table Renderer ───────────────────────────────────────────────────────────

interface TableProps {
    headers: string[];
    rows: string[][];
    textColor: string;
    mutedColor: string;
    borderColor: string;
    primaryColor: string;
    fontSize: number;
}

const TableRenderer = memo(({ headers, rows, textColor, mutedColor, borderColor, primaryColor, fontSize }: TableProps) => {
    const cellFontSize = Math.max(11, fontSize - 2);

    return (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={tableStyles.scroll}>
            <View style={[tableStyles.table, { borderColor }]}>
                {/* Header Row */}
                <View style={[tableStyles.row, tableStyles.headerRow, { backgroundColor: `${primaryColor}15`, borderBottomColor: borderColor }]}>
                    {headers.map((h, idx) => (
                        <View key={idx} style={[tableStyles.cell, tableStyles.headerCell, idx < headers.length - 1 && { borderRightColor: borderColor, borderRightWidth: StyleSheet.hairlineWidth }]}>
                            <Text style={[tableStyles.headerText, { color: textColor, fontSize: cellFontSize }]}>
                                {h}
                            </Text>
                        </View>
                    ))}
                </View>
                {/* Data Rows */}
                {rows.map((row, rowIdx) => (
                    <View
                        key={rowIdx}
                        style={[
                            tableStyles.row,
                            rowIdx % 2 === 1 && { backgroundColor: `${primaryColor}08` },
                            { borderBottomColor: borderColor },
                            rowIdx < rows.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth },
                        ]}
                    >
                        {row.map((cell, cellIdx) => (
                            <View key={cellIdx} style={[tableStyles.cell, cellIdx < row.length - 1 && { borderRightColor: borderColor, borderRightWidth: StyleSheet.hairlineWidth }]}>
                                <Text style={[tableStyles.cellText, { color: mutedColor, fontSize: cellFontSize }]}>
                                    {cell}
                                </Text>
                            </View>
                        ))}
                    </View>
                ))}
            </View>
        </ScrollView>
    );
});

const tableStyles = StyleSheet.create({
    scroll: { marginVertical: 8 },
    table: { borderWidth: 1, borderRadius: 10, overflow: 'hidden' },
    row: { flexDirection: 'row' },
    headerRow: { borderBottomWidth: 1 },
    cell: { minWidth: 80, maxWidth: 160, paddingHorizontal: 12, paddingVertical: 8 },
    headerCell: {},
    headerText: { fontWeight: '700' },
    cellText: { lineHeight: 18 },
});

// ─── Main Renderer ────────────────────────────────────────────────────────────

export const MarkdownRenderer = memo(({
    content,
    textColor,
    mutedColor,
    codeBackground,
    codeBorder,
    primaryColor,
    fontSize = 15,
    lineHeight = 23,
}: MarkdownRendererProps) => {
    const blocks = parseBlocks(content);

    return (
        <View style={styles.container}>
            {blocks.map((block, idx) => {
                switch (block.type) {
                    case 'h1':
                        return (
                            <View key={idx} style={[styles.headingWrapper, { borderLeftColor: primaryColor, marginTop: idx > 0 ? 16 : 0 }]}>
                                <Text style={[styles.h1, { color: textColor }]}>
                                    {block.content}
                                </Text>
                            </View>
                        );

                    case 'h2':
                        return (
                            <Text key={idx} style={[styles.h2, { color: textColor, marginBottom: 6, marginTop: idx > 0 ? 14 : 0 }]}>
                                {block.content}
                            </Text>
                        );

                    case 'h3':
                        return (
                            <Text key={idx} style={[styles.h3, { color: textColor, marginBottom: 4, marginTop: idx > 0 ? 10 : 0 }]}>
                                {block.content}
                            </Text>
                        );

                    case 'paragraph':
                        return (
                            <Text key={idx} style={{ marginBottom: 4 }}>
                                <InlineContent
                                    tokens={parseInline(block.content)}
                                    textColor={textColor}
                                    codeBackground={codeBackground}
                                    codeBorder={codeBorder}
                                    fontSize={fontSize}
                                    lineHeight={lineHeight}
                                />
                            </Text>
                        );

                    case 'bullet':
                        return (
                            <View key={idx} style={[styles.listItem, { marginLeft: block.depth * 16 }]}>
                                <Text style={[styles.bulletDot, { color: primaryColor }]}>•</Text>
                                <Text style={{ flex: 1 }}>
                                    <InlineContent
                                        tokens={parseInline(block.content)}
                                        textColor={textColor}
                                        codeBackground={codeBackground}
                                        codeBorder={codeBorder}
                                        fontSize={fontSize}
                                        lineHeight={lineHeight}
                                    />
                                </Text>
                            </View>
                        );

                    case 'ordered':
                        return (
                            <View key={idx} style={styles.listItem}>
                                <Text style={[styles.orderedNum, { color: primaryColor, fontSize }]}>{block.index}.</Text>
                                <Text style={{ flex: 1 }}>
                                    <InlineContent
                                        tokens={parseInline(block.content)}
                                        textColor={textColor}
                                        codeBackground={codeBackground}
                                        codeBorder={codeBorder}
                                        fontSize={fontSize}
                                        lineHeight={lineHeight}
                                    />
                                </Text>
                            </View>
                        );

                    case 'codeblock':
                        return (
                            <CodeBlock
                                key={idx}
                                content={block.content}
                                language={block.language}
                                codeBackground={codeBackground}
                                codeBorder={codeBorder}
                                mutedColor={mutedColor}
                            />
                        );

                    case 'table':
                        return (
                            <TableRenderer
                                key={idx}
                                headers={block.headers}
                                rows={block.rows}
                                textColor={textColor}
                                mutedColor={mutedColor}
                                borderColor={codeBorder}
                                primaryColor={primaryColor}
                                fontSize={fontSize}
                            />
                        );

                    case 'blockquote':
                        return (
                            <View key={idx} style={[styles.blockquote, { borderLeftColor: primaryColor, backgroundColor: `${primaryColor}12` }]}>
                                <Text>
                                    <InlineContent
                                        tokens={parseInline(block.content)}
                                        textColor={textColor}
                                        codeBackground={codeBackground}
                                        codeBorder={codeBorder}
                                        fontSize={fontSize}
                                        lineHeight={lineHeight}
                                    />
                                </Text>
                            </View>
                        );

                    case 'divider':
                        return (
                            <View key={idx} style={[styles.divider, { backgroundColor: codeBorder }]} />
                        );

                    case 'empty':
                        return <View key={idx} style={{ height: 8 }} />;

                    default:
                        return null;
                }
            })}
        </View>
    );
});

const styles = StyleSheet.create({
    container: { paddingVertical: 2 },
    headingWrapper: {
        borderLeftWidth: 3,
        paddingLeft: 10,
        marginBottom: 8,
    },
    h1: { fontSize: 20, fontWeight: '800', letterSpacing: -0.4 },
    h2: { fontSize: 17, fontWeight: '700' },
    h3: { fontSize: 15, fontWeight: '700' },
    listItem: { flexDirection: 'row', marginBottom: 5, alignItems: 'flex-start' },
    bulletDot: { fontSize: 18, marginRight: 8, marginTop: -2, fontWeight: '700' },
    orderedNum: { marginRight: 8, fontWeight: '700', minWidth: 20 },
    blockquote: {
        borderLeftWidth: 3,
        paddingLeft: 14,
        paddingVertical: 8,
        paddingRight: 8,
        borderRadius: 4,
        marginVertical: 6,
    },
    divider: { height: 1, marginVertical: 12 },
});
