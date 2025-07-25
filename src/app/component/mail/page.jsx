"use client";
import { useState, useEffect } from "react";
import "./mail.css";
import { IoSearch } from "react-icons/io5";
import Link from "next/link";
import axios from "axios";
import Header from "../../../Header/page";
import Menu from "../../../menu/Menu";

export default function MailList() {

    const URL = process.env.NEXT_PUBLIC_API_URL;
    const [mailList, setMailList] = useState([]);
    const [sort, setSort] = useState('mailList');
    const [align, setAlign] = useState('dateDesc');
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalFilteredPages, setTotalFilteredPages] = useState(1);
    const [searchType, setSearchType] = useState('mailSub');
    const [isSearch, setIsSearch] = useState(false);

    useEffect(() => {
        const member_id = sessionStorage.getItem("member_id");
        const token = sessionStorage.getItem("token");
        const dept = sessionStorage.getItem("dept_name");
        const adminYn = sessionStorage.getItem("admin_yn") === "true";

        if (!adminYn && (dept != "CS팀" || dept != "마케팅팀")) {
            alert("접근 권한이 없습니다.");
            location.href = "/component/main";
            return;
        }
        if (member_id && token && !isSearch) {
            getList(token);
        } else if (member_id && token && isSearch) {
            setMailList(sortList(mailList, align));
        } else {
            alert("로그인 후 이용해주세요.");
            location.href = '/';
        }
    }, [sort, align, currentPage]);

    // 검색결과용 리스트 재정렬
    const sortList = (arr, order) =>
        [...arr].sort((a, b) =>
            order === 'dateDesc'
                ? new Date(b.mailDate) - new Date(a.mailDate)
                : new Date(a.mailDate) - new Date(b.mailDate)
        );

    // 검색 입력 초기화
    useEffect(() => {
        setSearch('');
    }, [sort]);

    // 메일 목록 조회
    const getList = async (token) => {

        try {
            const { data } = await axios.get(`${URL}/mail/list`, {
                headers: {
                    Authorization: token
                },
                params: {
                    sort: sort,
                    page: currentPage,
                    align: align
                }
            });
            console.log(data);
            if (sort === 'mailList') {
                setMailList(data.mailList.content);
                setTotalFilteredPages(data.mailList.totalPages);
            } else {
                setMailList(data.autoSendList.content);
                setTotalFilteredPages(data.autoSendList.totalPages);
            }
        } catch (error) {
            alert("메일 목록 조회 중 오류가 발생했습니다. 다시 로그인 후 이용해주세요.");
            sessionStorage.removeItem("member_id");
            sessionStorage.removeItem("token");
            location.href = '/';
        }
    }

    // 메일 검색
    const searchMail = async (token) => {
        if (!token) {
            token = sessionStorage.getItem("token");
        }
        if (!search) {
            alert("검색어를 입력해주세요.");
            return;
        }
        try {
            const { data } = await axios.get(`${URL}/mail/search`, {
                headers: {
                    Authorization: token
                },
                params: {
                    search: search,
                    searchType: searchType,
                    page: currentPage,
                    sort: sort
                }
            });
            console.log(data);
            if (sort === 'mailList') {
                setMailList(data.mailSearchResult.content);
                setTotalFilteredPages(data.mailSearchResult.totalPages);
            } else {
                setMailList(data.autoSendSearchResult.content);
                setTotalFilteredPages(data.autoSendSearchResult.totalPages);
            }
        } catch (error) {
            alert("메일 검색 중 오류가 발생했습니다. 다시 로그인 후 이용해주세요.");
            sessionStorage.removeItem("member_id");
            sessionStorage.removeItem("token");
            location.href = '/';
        }
    }

    // 날짜를 한국 형식으로 포맷팅하는 함수
    const formatDate = (dateString) => {
        if (!dateString) return '-'; // 날짜 문자열이 없으면 '-' 반환

        const date = new Date(dateString); // 날짜 객체 생성
        // 날짜 부분을 한국어 형식으로 변환하고 공백 제거
        const datePart = date.toLocaleDateString('ko-KR').replace(/ /g, '');
        // 시간 부분을 24시간 형식으로 변환
        const timePart = date.toLocaleTimeString('ko-KR', {
            hour: '2-digit', // 시간: 두 자리 숫자
            minute: '2-digit', // 분: 두 자리 숫자
            hour12: false // 24시간 형식 사용
        });

        return `${datePart} ${timePart}`; // 날짜와 시간 조합하여 반환
    };

    return (
        <>
            <Header />
            <Menu />
            <div className="common-container">
                <h1 className={"mailList-title"}>발신 메일 리스트</h1>
                <div className={"mailList-background"}>
                    <div className={"mailList-header"}>
                        <div className={"mailList-search"}>
                            <select className={"mailList-sort"} onChange={(e) => { setSort(e.target.value); setIsSearch(false); }}>
                                <option value="mailList">발송된 메일</option>
                                <option value="autoSendList">정기 발송 메일 정보</option>
                            </select>
                            <span>메일 검색</span>
                            <div className={"mailList-input-wrapper"}>
                                <input
                                    type="text"
                                    placeholder={sort == "mailList" ? "발송된 메일 검색" : "정기 발송 메일 검색"}
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyUp={e => e.key === 'Enter' && searchMail() && setIsSearch(true)} />
                                <button className={"search-btn"} onClick={() => { searchMail(); setIsSearch(true) }}><IoSearch /></button>
                                <select className={"mailList-search-type"} onChange={(e) => setSearchType(e.target.value)}>
                                    <option value="mailSub">제목</option>
                                    <option value="recipient">수신자</option>
                                    <option value="memberId">담당자 ID</option>
                                </select>
                            </div>
                        </div>
                        <div className={"mailList-select-wrapper"}>
                            <select className={"mailList-align"} onChange={(e) => setAlign(e.target.value)}>
                                <option value="dateDesc">날짜 내림차순</option>
                                <option value="dateAsc">날짜 오름차순</option>
                            </select>
                        </div>
                    </div>

                    {mailList.length > 0 ?
                        mailList.map((mail) => (
                            <Link
                                key={mail.mailIdx ? mail.mailIdx : mail.scheduleIdx}
                                href={`/component/mail/detail/${mail.mailIdx ? `mailIdxEQ${mail.mailIdx}` : `scheduleIdxEQ${mail.scheduleIdx}`}`}
                                className={"mailList-item"}>
                                <div className={"mailList-subItem"}>
                                    <div className={"mailList-left"}>
                                        <div className={"mailList-itemTitle"}>📧 {mail.mailSub}</div>
                                        <div className={"mailList-recipient"}>
                                            {mail.recipient.includes("@") ? "수신인: " : "수신 유저 분류: "}
                                            <span style={{ color: 'white' }}>{mail.recipient}</span>
                                        </div>
                                        <div className={"mailList-member"}>담당자 ID: <span style={{ color: 'white' }}>{mail.memberId}</span></div>
                                    </div>
                                    <div className={"mailList-right-wrapper"}>
                                        <div className={"mailList-right"}>
                                            📆 {mail.mailDate ? formatDate(mail.mailDate) : formatDate(mail.createdAt)}
                                        </div>
                                        {sort == 'autoSendList' ?
                                            <>
                                                <div className={"mailList-right-autoSend"}>
                                                    {mail.active ? "다음 발송 예정일: " + mail.nextSendDate : "다음 발송 예정 없음"}
                                                </div>
                                                <div className={"mailList-right-autoSend"}>
                                                    {mail.intervalDays == 0 ? "단기 발송" : mail.intervalDays + "일 간격 발송"}
                                                </div>
                                            </>
                                            :
                                            <>
                                            </>
                                        }
                                    </div>
                                </div>
                            </Link>
                        ))
                        :
                        <div className="mailList-noResult">메일 목록이 없습니다.</div>
                    }
                    <div className="mailList-pagination">
                        <button disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>이전</button>
                        {Array.from({ length: totalFilteredPages }, (_, i) => i + 1).map((page) => (
                            <button
                                key={page}
                                className={currentPage === page ? 'active' : ''}
                                onClick={() => setCurrentPage(page)}
                            >
                                {page}
                            </button>
                        ))}
                        <button disabled={currentPage === totalFilteredPages} onClick={() => setCurrentPage(currentPage + 1)}>다음</button>
                    </div>
                </div>
            </div>
        </>
    );
}