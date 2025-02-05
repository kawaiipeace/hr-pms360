'use client';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css'; //if using mantine date picker features
import 'mantine-react-table/styles.css'; //make sure MRT styles were imported in your app root (once)
import { mkConfig, generateCsv, download } from 'export-to-csv'; //or use your library of choice here
import { useMemo, useState, Fragment } from 'react';
import {
  MantineReactTable,
  // createRow,
  type MRT_ColumnDef,
  type MRT_Row,
  type MRT_TableOptions,
  useMantineReactTable,
} from 'mantine-react-table';
import { ActionIcon, Button, Flex, Text, Tooltip, Box, Menu, Title } from '@mantine/core';
import { ModalsProvider, modals } from '@mantine/modals';
import { MdSend, MdSave, MdFlag, MdOutlineClose, MdNotificationImportant, MdDownload } from "react-icons/md";
import { FaFileExport, FaFileCircleCheck } from "react-icons/fa6";
import { BsBank2 } from "react-icons/bs";
import { SiSap } from "react-icons/si";
import {
  QueryClient,
  QueryClientProvider,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { type TransactionDailyData, fakeData, fuel_product, is_credit_vat } from '@/components/dummydata_transaction_daily';
import { Tab } from '@headlessui/react';
import { getTranslation } from '@/i18n';

const csvConfig = mkConfig({
  fieldSeparator: ',',
  filename: 'vms-fcms',
  decimalSeparator: '.',
  useKeysAsHeaders: true,
});

const Example = () => {
  const { t } = getTranslation();
  const [isAlertVisible, setIsAlertVisible] = useState(true);
  const handleCloseAlert = () => {
    setIsAlertVisible(false);
  };

  const handleExportRows = (rows: MRT_Row<TransactionDailyData>[]) => {
    const rowData = rows.map((row) => row.original);
    const csv = generateCsv(csvConfig)(rowData);
    download(csvConfig)(csv);
  };

  const handleExportData = () => {
    const csv = generateCsv(csvConfig)(fakeData);
    download(csvConfig)(csv);
  };

  const [validationErrors, setValidationErrors] = useState<
    Record<string, string | undefined>
  >({});
  //keep track of rows that have been edited
  const [editedUsers, setEditedUsers] = useState<Record<string, TransactionDailyData>>({});

  //call CREATE hook
  const { mutateAsync: createUser, isPending: isCreatingUser } =
    useCreateUser();
  //call READ hook
  const {
    data: fetchedUsers = [],
    isError: isLoadingUsersError,
    isFetching: isFetchingUsers,
    isLoading: isLoadingUsers,
  } = useGetUsers();
  //call UPDATE hook
  const { mutateAsync: updateUsers, isPending: isUpdatingUser } =
    useUpdateUsers();
  //call DELETE hook
  const { mutateAsync: deleteUser, isPending: isDeletingUser } =
    useDeleteUser();

  //CREATE action
  const handleCreateUser: MRT_TableOptions<TransactionDailyData>['onCreatingRowSave'] = async ({
    values,
    exitCreatingMode,
  }) => {
    const newValidationErrors = validateUser(values);
    if (Object.values(newValidationErrors).some((error) => !!error)) {
      setValidationErrors(newValidationErrors);
      return;
    }
    setValidationErrors({});
    await createUser(values);
    exitCreatingMode();
  };

  //UPDATE action
  const handleSaveUsers = async () => {
    if (Object.values(validationErrors).some((error) => !!error)) return;
    await updateUsers(Object.values(editedUsers));
    setEditedUsers({});
  };

  //DELETE action
  const openDeleteConfirmModal = (row: MRT_Row<TransactionDailyData>) =>
    modals.openConfirmModal({
      title: 'Are you sure you want to delete this user?',
      children: (
        <Text>
          Are you sure you want to delete {row.original.firstName}{' '}
          {row.original.lastName}? This action cannot be undone.
        </Text>
      ),
      labels: { confirm: 'Delete', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: () => deleteUser(row.original.id),
    });

  const columns = useMemo<MRT_ColumnDef<TransactionDailyData>[]>(
    () => [
      {
        accessorKey: 'transaction_date',
        header: 'วันที่ทำรายการ',
        enableEditing: false,
        size: 80,
      },
      {
        accessorKey: 'license_plate_number',
        header: 'ทะเบียน',
        enableEditing: false,
        size: 80,
      },
      {
        accessorKey: 'fleet_card_number',
        header: 'หมายเลขบัตร',
        enableEditing: false,
        size: 80,
      },
      {
        accessorKey: 'bank_abbreviation',
        header: 'ธนาคาร',
        enableEditing: false,
        size: 80,
      },
      {
        accessorKey: 'liter',
        header: 'จำนวนลิตร',
        enableEditing: false,
        size: 80,
      },
      {
        accessorKey: 'total_amount_baht',
        header: 'ยอดสุทธิ',
        enableEditing: false,
        size: 80,
      },
      {
        accessorKey: 'bank_vendor_code',
        header: 'รหัสเจ้าหนี้ของธนาคาร ✏️',
        mantineEditTextInputProps: ({ cell, row }) => ({
          type: 'text',
          required: true,
          error: validationErrors?.[cell.id],
          //store edited user in state to be saved later
          onBlur: (event) => {
            const validationError = !validateRequired(event.currentTarget.value)
              ? 'Required'
              : undefined;
            setValidationErrors({
              ...validationErrors,
              [cell.id]: validationError,
            });
            setEditedUsers({ ...editedUsers, [row.id]: row.original });
          },
        }),
      },
      {
        accessorKey: 'business_partner',
        header: 'สถานที่ขอรับเงิน (BP) ✏️',
        mantineEditTextInputProps: ({ cell, row }) => ({
          type: 'text',
          required: true,
          error: validationErrors?.[cell.id],
          //store edited user in state to be saved later
          onBlur: (event) => {
            const validationError = !validateRequired(event.currentTarget.value)
              ? 'Required'
              : undefined;
            setValidationErrors({
              ...validationErrors,
              [cell.id]: validationError,
            });
            setEditedUsers({ ...editedUsers, [row.id]: row.original });
          },
        }),
      },
      {
        accessorKey: 'vendor_onetime_pc',
        header: 'รหัสบัญชีเจ้าหนี้ขาจร ✏️',
        mantineEditTextInputProps: ({ cell, row }) => ({
          type: 'text',
          required: true,
          error: validationErrors?.[cell.id],
          //store edited user in state to be saved later
          onBlur: (event) => {
            const validationError = !validateRequired(event.currentTarget.value)
              ? 'Required'
              : undefined;
            setValidationErrors({
              ...validationErrors,
              [cell.id]: validationError,
            });
            setEditedUsers({ ...editedUsers, [row.id]: row.original });
          },
        }),
      },
      {
        accessorKey: 'sap_cost_center',
        header: 'ศูนย์ต้นทุน ✏️',
        mantineEditTextInputProps: ({ cell, row }) => ({
          type: 'text',
          required: true,
          error: validationErrors?.[cell.id],
          //store edited user in state to be saved later
          onBlur: (event) => {
            const validationError = !validateEmail(event.currentTarget.value)
              ? 'Invalid Email'
              : undefined;
            setValidationErrors({
              ...validationErrors,
              [cell.id]: validationError,
            });
            setEditedUsers({ ...editedUsers, [row.id]: row.original });
          },
        }),
      },
      {
        accessorKey: 'gl_account',
        header: 'บัญชี GL ✏️',
        mantineEditTextInputProps: ({ cell, row }) => ({
          type: 'text',
          required: true,
          error: validationErrors?.[cell.id],
          //store edited user in state to be saved later
          onBlur: (event) => {
            const validationError = !validateEmail(event.currentTarget.value)
              ? 'Invalid Email'
              : undefined;
            setValidationErrors({
              ...validationErrors,
              [cell.id]: validationError,
            });
            setEditedUsers({ ...editedUsers, [row.id]: row.original });
          },
        }),
      },
      {
        accessorKey: 'product',
        header: 'ประเภทน้ำมัน ✏️',
        editVariant: 'select',
        mantineEditSelectProps: ({ row }) => ({
          data: fuel_product,
          onChange: (value: any) =>
            setEditedUsers({
              ...editedUsers,
              [row.id]: { ...row.original, state: value },
            }),
        }),
      },
      {
        accessorKey: 'is_credit_vat',
        header: 'การเครดิตภาษี ✏️',
        editVariant: 'select',
        mantineEditSelectProps: ({ row }) => ({
          data: is_credit_vat,
          onChange: (value: any) =>
            setEditedUsers({
              ...editedUsers,
              [row.id]: { ...row.original, state: value },
            }),
        }),
      },
    ],
    [editedUsers, validationErrors],
  );

  const table = useMantineReactTable({
    columns,
    data: fetchedUsers,
    createDisplayMode: 'row', // ('modal', and 'custom' are also available)
    editDisplayMode: 'cell', // ('modal', 'row', 'table', and 'custom' are also available)
    enableEditing: true,
    enableColumnPinning: true,
    enableRowActions: true,
    positionActionsColumn: 'last',
    enableRowSelection: true,
    enableColumnOrdering: true,
    //enableColumnResizing: true,
    enableGrouping: true,
    enableStickyHeader: true,
    getRowId: (row) => row.id,
    mantineToolbarAlertBannerProps: isLoadingUsersError
      ? {
        color: 'red',
        children: 'Error loading data',
      }
      : {
        color: 'violet',
      },
    mantineTableContainerProps: {
      style: {
        minHeight: '500px',
      },
    },
    mantineSelectCheckboxProps: {
      color: 'violet',
    },
    mantineSelectAllCheckboxProps: {
      color: 'violet',
    },
    mantineProgressProps: {
      color: 'violet',
    },
    onCreatingRowCancel: () => setValidationErrors({}),
    onCreatingRowSave: handleCreateUser,
    renderRowActions: ({ row }) => (
      /*
      <Tooltip label="Delete">
        <ActionIcon color="red" onClick={() => openDeleteConfirmModal(row)}>
          <IconTrash />
        </ActionIcon>
      </Tooltip>
      */
      <Flex align="center" gap="md">
        <Tooltip label="ส่งขึ้น SAP">
          <ActionIcon color="blue">
            <MdSend />
          </ActionIcon>
        </Tooltip>
        <Tooltip label="บันทึกข้อมูล">
          <ActionIcon color="yellow">
            <MdSave />
          </ActionIcon>
        </Tooltip>
        <Tooltip label="ทำเครื่องหมายผิดปกติ">
          <ActionIcon color="red">
            <MdFlag />
          </ActionIcon>
        </Tooltip>
      </Flex>
    ),
    renderBottomToolbarCustomActions: () => (
      <Flex align="center" gap="md">
        <Button
          color="blue"
          onClick={handleSaveUsers}
          disabled={
            Object.keys(editedUsers).length === 0 ||
            Object.values(validationErrors).some((error) => !!error)
          }
          loading={isUpdatingUser}
        >
          {t('บันทึกและส่งขึ้น SAP')}
        </Button>
        <Button
          color="yellow"
          onClick={handleSaveUsers}
          disabled={
            Object.keys(editedUsers).length === 0 ||
            Object.values(validationErrors).some((error) => !!error)
          }
          loading={isUpdatingUser}
        >
          {t('บันทึกข้อมูล')}
        </Button>
        <Button
          color="red"
          onClick={handleSaveUsers}
          disabled={
            Object.keys(editedUsers).length === 0 ||
            Object.values(validationErrors).some((error) => !!error)
          }
          loading={isUpdatingUser}
        >
          {t('ทำเครื่องหมายผิดปกติ')}
        </Button>
        {Object.values(validationErrors).some((error) => !!error) && (
          <Text color="red">Fix errors before submitting</Text>
        )}
      </Flex>

    ),

    renderDetailPanel: ({ row }) => (

      <div className="mb-5 flex flex-col sm:flex-row">
        <Tab.Group>
          <div className="mx-10 mb-5 sm:mb-0">
            <Tab.List className="m-auto flex w-24 flex-col justify-center space-y-3">
              <Tab as={Fragment}>
                {({ selected }) => (
                  <div className="flex-auto text-center !outline-none">
                    <button
                      className={`${selected ? '!bg-secondary text-white !outline-none' : ''} duration-300 flex h-16 w-16 flex-col items-center justify-center rounded-full bg-[#e0e0e0] transition-all hover:!bg-secondary hover:text-white hover:shadow-[0_5px_15px_0_rgba(0,0,0,0.30)] dark:bg-[#191e3a]`}
                    >
                      <BsBank2 className='w-5 h-5' />
                    </button>
                  </div>
                )}
              </Tab>
              <Tab as={Fragment}>
                {({ selected }) => (
                  <button
                    className={`${selected ? '!bg-secondary text-white !outline-none' : ''} duration-300 flex h-16 w-16 flex-col items-center justify-center rounded-full bg-[#e0e0e0] transition-all hover:!bg-secondary hover:text-white hover:shadow-[0_5px_15px_0_rgba(0,0,0,0.30)] dark:bg-[#191e3a]`}
                  >
                    <SiSap className='w-8 h-8' />
                  </button>
                )}
              </Tab>
            </Tab.List>
          </div>
          <Tab.Panels>
            <Tab.Panel>
              <div className="active">
                <div className="flex flex-col flex-wrap justify-between gap-8 lg:flex-row">
                  <div className="flex flex-col justify-between gap-8 sm:flex-row">
                    <div className="lg:w-2/3">
                      <div className="mb-2 flex w-full items-center justify-between">
                        <div className="text-white-dark">วันที่ตั้งหนี้ :</div>
                        <div>{row.original.settlement_date}</div>
                      </div>
                      <div className="mb-2 flex w-full items-center justify-between">
                        <div className="text-white-dark">เจ้าของบัตร :</div>
                        <div>{row.original.cardholder_name}</div>
                      </div>
                      <div className="mb-2 flex w-full items-center justify-between">
                        <div className="text-white-dark">รหัสแผนก :</div>
                        <div>{row.original.bank_cost_center}</div>
                      </div>
                      <div className="flex w-full items-center justify-between">
                        <div className="text-white-dark">แผนก :</div>
                        <div>{row.original.department}</div>
                      </div>
                      <div className="flex w-full items-center justify-between">
                        <div className="text-white-dark">รหัสสถานีบริการ :</div>
                        <div>{row.original.merchant_id}</div>
                      </div>
                      <div className="flex w-full items-center justify-between">
                        <div className="text-white-dark">ชื่อสถานีบริการ :</div>
                        <div>{row.original.merchant_name}</div>
                      </div>
                      <div className="flex w-full items-center justify-between">
                        <div className="text-white-dark">ที่อยู่ :</div>
                        <div>{row.original.full_address}</div>
                      </div>
                    </div>
                    <div className="lg:w-1/3">
                      <div className="mb-2 flex w-full items-center justify-between">
                        <div className="text-white-dark">เลขที่ใบกำกับภาษี :</div>
                        <div>{row.original.invoice_number}</div>
                      </div>
                      <div className="mb-2 flex w-full items-center justify-between">
                        <div className="text-white-dark">เลขกิโลเมตร :</div>
                        <div>{row.original.odometer}</div>
                      </div>
                      <div className="mb-2 flex w-full items-center justify-between">
                        <div className="text-white-dark">ผลิตภัณฑ์ :</div>
                        <div>{row.original.product}</div>
                      </div>
                      <div className="flex w-full items-center justify-between">
                        <div className="text-white-dark">ราคาก่อนภาษี :</div>
                        <div>{row.original.amount_before_vat_baht}</div>
                      </div>
                      <div className="flex w-full items-center justify-between">
                        <div className="text-white-dark">ภาษีมูลค่าเพิ่ม :</div>
                        <div>{row.original.vat_baht}</div>
                      </div>
                      <div className="flex w-full items-center justify-between">
                        <div className="text-white-dark">เลขที่ผู้เสียภาษีคู่ค้า :</div>
                        <div>{row.original.merchant_account_tax_id}</div>
                      </div>
                      <div className="flex w-full items-center justify-between">
                        <div className="text-white-dark">เลขที่สาขาคู่ค้า :</div>
                        <div>{row.original.merchant_account_tax_branch}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Tab.Panel>
            <Tab.Panel>
              <div>
                <div className="flex flex-col flex-wrap justify-between gap-8 lg:flex-row">
                  <div className="flex flex-col justify-between gap-8 sm:flex-row">
                    <div>
                      <div className="mb-2 flex w-full items-center justify-between">
                        <div className="text-white-dark">วันที่ตั้งหนี้ :</div>
                        <div>{row.original.settlement_date}</div>
                      </div>
                      <div className="mb-2 flex w-full items-center justify-between">
                        <div className="text-white-dark">เจ้าของบัตร :</div>
                        <div>{row.original.cardholder_name}</div>
                      </div>
                      <div className="mb-2 flex w-full items-center justify-between">
                        <div className="text-white-dark">รหัสแผนก :</div>
                        <div>{row.original.bank_cost_center}</div>
                      </div>
                      <div className="flex w-full items-center justify-between">
                        <div className="text-white-dark">แผนก :</div>
                        <div>{row.original.department}</div>
                      </div>
                      <div className="flex w-full items-center justify-between">
                        <div className="text-white-dark">รหัสสถานีบริการ :</div>
                        <div>{row.original.merchant_id}</div>
                      </div>
                      <div className="flex w-full items-center justify-between">
                        <div className="text-white-dark">ชื่อสถานีบริการ :</div>
                        <div>{row.original.merchant_name}</div>
                      </div>
                      <div className="flex w-full items-center justify-between">
                        <div className="text-white-dark">สถานที่ตั้ง :</div>
                        <div>{row.original.full_address}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </div>
    ),

    renderTopToolbarCustomActions: ({ table }) => (
      <div className="mb-5">
        <div className="flex flex-wrap items-center justify-center gap-2">
          <button type="button" className="btn btn-outline-secondary"
            onClick={handleExportData}
          >
            <FaFileExport className="w-5 h-5" />&nbsp; ส่งออกทั้งหมด
          </button>
          <button type="button" className="btn btn-outline-secondary"
            disabled={
              !table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()
            }
            //only export selected rows
            onClick={() => handleExportRows(table.getSelectedRowModel().rows)}
          >
            <FaFileCircleCheck className="w-5 h-5" />&nbsp; ส่งออกที่เลือก
          </button>
        </div>
      </div>
    ),

    state: {
      isLoading: isLoadingUsers,
      isSaving: isCreatingUser || isUpdatingUser || isDeletingUser,
      showAlertBanner: isLoadingUsersError,
      showProgressBars: isFetchingUsers,
    },
    localization: {
      actions: 'การดำเนินการ',
      and: 'และ',
      cancel: 'ยกเลิก',
      changeFilterMode: 'เปลี่ยนโหมดการกรอง',
      changeSearchMode: 'เปลี่ยนโหมดการค้นหา',
      clearFilter: 'ล้างการกรอง',
      clearSearch: 'ล้างการค้นหา',
      clearSelection: 'ล้างการเลือก',
      clearSort: 'ล้างการเรียงลำดับ',
      clickToCopy: 'คลิ๊กเพื่อคัดลอก',
      copy: 'คัดลอก',
      collapse: 'ยุบ',
      collapseAll: 'ยุบทั้งหมด',
      columnActions: 'คอลัมน์การดำเนินการ',
      copiedToClipboard: 'คัดลอกไปยังคลิปบอร์ดแล้ว',
      dropToGroupBy: 'วางคอลัมน์ {column} เพื่อจัดกลุ่ม',
      edit: 'แก้ไข',
      expand: 'ขยาย',
      expandAll: 'ขยายทั้งหมด',
      filterArrIncludes: 'รวมถึง',
      filterArrIncludesAll: 'รวมถึงทั้งหมด',
      filterArrIncludesSome: 'รวมถึง',
      filterBetween: 'ระหว่าง',
      filterBetweenInclusive: 'ระหว่างการรวม',
      filterByColumn: 'กรองโดย {column}',
      filterContains: 'ประกอบไปด้วย',
      filterEmpty: 'ว่างเปล่า',
      filterEndsWith: 'สิ้นสุดด้วย',
      filterEquals: 'เท่ากับ',
      filterEqualsString: 'เทียบเท่า',
      filterFuzzy: 'ความฟัซซี่',
      filterGreaterThan: 'มากกว่า',
      filterGreaterThanOrEqualTo: 'มากกว่าหรือเท่ากับ',
      filterInNumberRange: 'ระหว่าง',
      filterIncludesString: 'ประกอบไปด้วย',
      filterIncludesStringSensitive: 'ประกอบไปด้วย',
      filterLessThan: 'น้อยกว่า',
      filterLessThanOrEqualTo: 'น้อยกว่าหรือเท่ากับ',
      filterMode: 'โหมดการกรอง: {filterType}',
      filterNotEmpty: 'ไม่ว่างเปล่า',
      filterNotEquals: 'ไม่เท่ากับ',
      filterStartsWith: 'เริ่มต้นด้วย',
      filterWeakEquals: 'เท่ากับ',
      filteringByColumn: 'กรองโดย {column} - {filterType} {filterValue}',
      goToFirstPage: 'ไปยังหน้าแรก',
      goToLastPage: 'ไปยังหน้าสุดท้าย',
      goToNextPage: 'ไปยังหน้าถัดไป',
      goToPreviousPage: 'ไปยังหน้าก่อนหน้า',
      grab: 'จับ',
      groupByColumn: 'จัดกลุ่มโดย {column}',
      groupedBy: 'จัดกลุ่มแล้วโดย ',
      hideAll: 'ซ่อนทั้งหมด',
      hideColumn: 'ซ่อนคอลัมน์ {column}',
      max: 'สูงสุด',
      min: 'ต่ำสุด',
      move: 'ย้าย',
      noRecordsToDisplay: 'ไม่มีข้อมูลในการแสดง',
      noResultsFound: 'ไม่พบผลลัพธ์',
      of: 'ของ',
      or: 'หรือ',
      pin: 'ปักหมุด',
      pinToLeft: 'ปักหมุดทางซ้าย',
      pinToRight: 'ปักหมุดทางขวา',
      resetColumnSize: 'รีเซ็ตขนาดคอลัมน์',
      resetOrder: 'รีเซ็ตการเรียง',
      rowActions: 'แถวการดำเนินการ',
      rowNumber: '#',
      rowNumbers: 'จำนวนแถว',
      rowsPerPage: 'แถวต่อหน้า',
      save: 'บันทึก',
      search: 'ค้นหา',
      selectedCountOfRowCountRowsSelected:
        '{selectedCount} ของ {rowCount} จำนวนแถวที่ถูกเลือก',
      select: 'เลือก',
      showAll: 'แสดงทั้งหมด',
      showAllColumns: 'แสดงคอลัมน์ทั้งหมด',
      showHideColumns: 'แสดง/ซ่อน คอลัมน์',
      showHideFilters: 'แสดง/ซ่อน การกรอง',
      showHideSearch: 'แสดง/ซ่อน การค้นหา',
      sortByColumnAsc: 'เรียงโดย {column} จากน้อยไปมาก',
      sortByColumnDesc: 'เรียงโดย {column} จากมากไปน้อย',
      sortedByColumnAsc: 'เรียงแล้วโดย {column} จากน้อยไปมาก',
      sortedByColumnDesc: 'เรียงแล้วโดย {column} จากมากไปน้อย',
      thenBy: ', จากนั้นโดย ',
      toggleDensity: 'การกระจาย',
      toggleFullScreen: 'เปิด/ปิด เต็มหน้าจอ',
      toggleSelectAll: 'ปรับให้เลือกทั้งหมด',
      toggleSelectRow: 'ปรับให้เลือกแถว',
      toggleVisibility: 'ปรับให้มองเห็น',
      ungroupByColumn: 'ยกเลิกจัดกลุ่มโดย {column}',
      unpin: 'เลิกปักหมุด',
      unpinAll: 'เลิกปักหมุดทั้งหมด',
    },
  });

  return (
    <>
      {isAlertVisible && (
        <div className="relative flex items-center border p-3.5 mb-3 rounded before:absolute before:top-1/2 ltr:before:left-0 rtl:before:right-0 rtl:before:rotate-180 before:-mt-2 before:border-l-8 before:border-t-8 before:border-b-8 before:border-t-transparent before:border-b-transparent before:border-l-inherit text-secondary bg-secondary-light !border-secondary ltr:border-l-[64px] rtl:border-r-[64px] dark:bg-secondary-dark-light">
          <span className="absolute ltr:-left-12 rtl:-right-12 inset-y-0 text-white w-7 h-7 m-auto">
            <MdNotificationImportant className='h-7 w-7' />
          </span>
          <span className="ltr:pr-2 rtl:pl-2">
            ข้อมูลธุรกรรมจะอัพเดทอัตโนมัติในทุก ๆ วัน
          </span>
          <button type="button" className="ltr:ml-auto rtl:mr-auto hover:opacity-80" onClick={handleCloseAlert}>
            <MdOutlineClose />
          </button>
        </div>
      )}
      <MantineReactTable table={table} />
    </>
  );
};

//CREATE hook (post new user to api)
function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (user: TransactionDailyData) => {
      //send api update request here
      await new Promise((resolve) => setTimeout(resolve, 1000)); //fake api call
      return Promise.resolve();
    },
    //client side optimistic update
    onMutate: (newUserInfo: TransactionDailyData) => {
      queryClient.setQueryData(
        ['users'],
        (prevUsers: any) =>
          [
            ...prevUsers,
            {
              ...newUserInfo,
              id: (Math.random() + 1).toString(36).substring(7),
            },
          ] as TransactionDailyData[],
      );
    },
    // onSettled: () => queryClient.invalidateQueries({ queryKey: ['users'] }), //refetch users after mutation, disabled for demo
  });
}

//READ hook (get users from api)
function useGetUsers() {
  return useQuery<TransactionDailyData[]>({
    queryKey: ['users'],
    queryFn: async () => {
      //send api request here
      await new Promise((resolve) => setTimeout(resolve, 1000)); //fake api call
      return Promise.resolve(fakeData);
    },
    refetchOnWindowFocus: false,
  });
}

//UPDATE hook (put users in api)
function useUpdateUsers() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (users: TransactionDailyData[]) => {
      //send api update request here
      await new Promise((resolve) => setTimeout(resolve, 1000)); //fake api call
      return Promise.resolve();
    },
    //client side optimistic update
    onMutate: (newUsers: TransactionDailyData[]) => {
      queryClient.setQueryData(['users'], (prevUsers: any) =>
        prevUsers?.map((user: TransactionDailyData) => {
          const newUser = newUsers.find((u) => u.id === user.id);
          return newUser ? newUser : user;
        }),
      );
    },
    // onSettled: () => queryClient.invalidateQueries({ queryKey: ['users'] }), //refetch users after mutation, disabled for demo
  });
}

//DELETE hook (delete user in api)
function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => {
      //send api update request here
      await new Promise((resolve) => setTimeout(resolve, 1000)); //fake api call
      return Promise.resolve();
    },
    //client side optimistic update
    onMutate: (userId: string) => {
      queryClient.setQueryData(['users'], (prevUsers: any) =>
        prevUsers?.filter((user: TransactionDailyData) => user.id !== userId),
      );
    },
    // onSettled: () => queryClient.invalidateQueries({ queryKey: ['users'] }), //refetch users after mutation, disabled for demo
  });
}

const queryClient = new QueryClient();

const ExampleWithProviders = () => (
  //Put this with your other react-query providers near root of your app
  <QueryClientProvider client={queryClient}>
    <ModalsProvider>
      <Example />
    </ModalsProvider>
  </QueryClientProvider>
);

export default ExampleWithProviders;

const validateRequired = (value: string) => !!value?.length;
const validateEmail = (email: string) =>
  !!email.length &&
  email
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
    );

function validateUser(user: TransactionDailyData) {
  return {
    firstName: !validateRequired(user.firstName)
      ? 'First Name is Required'
      : '',
    lastName: !validateRequired(user.lastName) ? 'Last Name is Required' : '',
    email: !validateEmail(user.email) ? 'Incorrect Email Format' : '',
  };
}
