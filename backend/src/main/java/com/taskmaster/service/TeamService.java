package com.taskmaster.service;

import com.taskmaster.model.Team;
import com.taskmaster.model.TeamMember;
import com.taskmaster.repository.TeamMemberRepository;
import com.taskmaster.repository.TeamRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class TeamService {

    private final TeamRepository teamRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final NotificationService notificationService;

    public TeamService(TeamRepository teamRepository, TeamMemberRepository teamMemberRepository, NotificationService notificationService) {
        this.teamRepository = teamRepository;
        this.teamMemberRepository = teamMemberRepository;
        this.notificationService = notificationService;
    }

    public List<Team> getAllTeams() {
        return teamRepository.findAll();
    }

    public Optional<Team> getTeamById(Long id) {
        return teamRepository.findById(id);
    }

    @Transactional
    public Team createTeam(Team team) {
        Team saved = teamRepository.save(team);
        notificationService.broadcast("TEAM_CREATED", "TEAM", saved.getId(), null, saved, "Team created: " + saved.getName());
        return saved;
    }

    @Transactional
    public Team updateTeam(Long id, Team teamDetails) {
        Team team = teamRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Team not found with id " + id));

        team.setName(teamDetails.getName());
        team.setDescription(teamDetails.getDescription());
        team.setColor(teamDetails.getColor());

        Team updated = teamRepository.save(team);
        notificationService.broadcast("TEAM_UPDATED", "TEAM", updated.getId(), null, updated, "Team updated: " + updated.getName());
        return updated;
    }

    @Transactional
    public void deleteTeam(Long id) {
        teamRepository.deleteById(id);
        notificationService.broadcast("TEAM_DELETED", "TEAM", id, null, null, "Team deleted");
    }

    public List<TeamMember> getAllMembers() {
        return teamMemberRepository.findAll();
    }

    @Transactional
    public TeamMember addMemberToTeam(Long teamId, TeamMember member) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new RuntimeException("Team not found with id " + teamId));
        member.setTeam(team);
        TeamMember saved = teamMemberRepository.save(member);
        notificationService.broadcast("MEMBER_ADDED", "TEAM_MEMBER", saved.getId(), null, saved, "Member added: " + saved.getName());
        return saved;
    }

    @Transactional
    public void removeMember(Long memberId) {
        teamMemberRepository.deleteById(memberId);
        notificationService.broadcast("MEMBER_REMOVED", "TEAM_MEMBER", memberId, null, null, "Member removed");
    }
}
