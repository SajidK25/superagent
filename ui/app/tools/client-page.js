"use client";
import { useState } from "react";
import {
  Button,
  Heading,
  Icon,
  Stack,
  Text,
  useDisclosure,
  IconButton,
  Tag,
  SimpleGrid,
  HStack,
  useToast,
} from "@chakra-ui/react";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";
import { TbPlus, TbTrash } from "react-icons/tb";
import API from "@/lib/api";
import { analytics } from "@/lib/analytics";
import ToolsModal from "./modal";
import SearchBar from "../_components/search-bar";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

function ToolCard({ id, name, createdAt, type, onDelete }) {
  return (
    <Stack borderWidth="1px" borderRadius="md" padding={4}>
      <HStack justifyContent="space-between" flex={1}>
        <Text noOfLines={1} as="b" flex={1}>
          {name}
        </Text>
        <Text fontSize="sm" color="gray.500">
          {dayjs(createdAt).fromNow()}
        </Text>
      </HStack>
      <HStack justifyContent="space-between">
        <Tag variant="subtle" colorScheme="green" size="sm">
          {type}
        </Tag>
        <IconButton
          size="sm"
          variant="ghost"
          icon={<Icon fontSize="lg" as={TbTrash} color="gray.500" />}
          onClick={() => onDelete(id)}
        />
      </HStack>
    </Stack>
  );
}

export default function ToolsClientPage({ data, session }) {
  const [filteredData, setData] = useState();
  const { isOpen, onClose, onOpen } = useDisclosure();
  const router = useRouter();
  const toast = useToast();
  const api = new API(session);

  const onSubmit = async (values) => {
    await api.createTool({ ...values });

    if (process.env.NEXT_PUBLIC_SEGMENT_WRITE_KEY) {
      analytics.track("Created Tool", { ...values });
    }

    toast({
      description: "Tool created",
      position: "top",
      colorScheme: "gray",
    });

    setData();
    router.refresh();
    onClose();
  };

  const handleDelete = async (id) => {
    await api.deleteTool({ id });

    if (process.env.NEXT_PUBLIC_SEGMENT_WRITE_KEY) {
      analytics.track("Deleted Tool", { id });
    }

    toast({
      description: "Tool deleted",
      position: "top",
      colorScheme: "gray",
    });

    setData();
    router.refresh();
  };

  const handleSearch = ({ searchTerm }) => {
    if (!searchTerm) {
      setData(data);
    }

    const keysToFilter = ["name", "type"];
    const filteredItems = data.filter((item) =>
      keysToFilter.some((key) =>
        item[key].toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    );

    setData(filteredItems);
  };

  return (
    <Stack
      flex={1}
      paddingX={[6, 12]}
      paddingY={12}
      spacing={6}
      overflow="auto"
    >
      <HStack justifyContent="space-between">
        <Stack>
          <Heading as="h1" fontSize="2xl">
            Tools
          </Heading>
          <Text color="gray.400" display={["none", "block"]}>
            Create instances of specific tools to use with your Agents.
          </Text>
        </Stack>
        <Button
          leftIcon={<Icon as={TbPlus} />}
          alignSelf="flex-start"
          onClick={onOpen}
        >
          New tool
        </Button>
      </HStack>
      <SearchBar
        onSearch={(values) => handleSearch(values)}
        onReset={() => setData(data)}
      />
      <Stack spacing={4}>
        <SimpleGrid columns={[1, 2, 2, 4]} gap={6}>
          {filteredData
            ? filteredData?.map(({ id, createdAt, name, type }) => (
                <ToolCard
                  key={id}
                  createdAt={createdAt}
                  id={id}
                  name={name}
                  type={type}
                  onDelete={(id) => handleDelete(id)}
                />
              ))
            : data?.map(({ id, createdAt, name, type }) => (
                <ToolCard
                  key={id}
                  createdAt={createdAt}
                  id={id}
                  name={name}
                  type={type}
                  onDelete={(id) => handleDelete(id)}
                />
              ))}
        </SimpleGrid>
      </Stack>
      <ToolsModal
        onSubmit={onSubmit}
        isOpen={isOpen}
        onClose={onClose}
        onOpen={onOpen}
      />
    </Stack>
  );
}
