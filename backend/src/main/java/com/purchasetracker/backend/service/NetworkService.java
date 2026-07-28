package com.purchasetracker.backend.service;

import com.purchasetracker.backend.dto.CreateNetworkRequest;
import com.purchasetracker.backend.dto.JoinNetworkRequest;
import com.purchasetracker.backend.dto.MemberResponse;
import com.purchasetracker.backend.dto.NetworkResponse;
import com.purchasetracker.backend.entity.FamilyNetwork;
import com.purchasetracker.backend.entity.NetworkMember;
import com.purchasetracker.backend.entity.User;
import com.purchasetracker.backend.repository.FamilyNetworkRepository;
import com.purchasetracker.backend.repository.NetworkMemberRepository;
import com.purchasetracker.backend.repository.UserRepository;
import com.purchasetracker.backend.security.CurrentUserProvider;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.util.List;

@Service
public class NetworkService {
    
    private static final String CODE_CHARACTERS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private static final int CODE_LENGTH = 8;
    private static final SecureRandom RANDOM = new SecureRandom();

    private final FamilyNetworkRepository familyNetworkRepository;
    private final NetworkMemberRepository networkMemberRepository;
    private final UserRepository userRepository;
    private final CurrentUserProvider currentUserProvider;

    public NetworkService(
        FamilyNetworkRepository familyNetworkRepository,
        NetworkMemberRepository networkMemberRepository,
        UserRepository userRepository,
        CurrentUserProvider currentUserProvider
    ) {
        this.familyNetworkRepository = familyNetworkRepository;
        this.networkMemberRepository = networkMemberRepository;
        this.userRepository = userRepository;
        this.currentUserProvider = currentUserProvider;
    }

    public NetworkResponse createNetwork(CreateNetworkRequest request) {
        Long currentUserId = currentUserProvider.getCurrentUserId();
        User currentUser = userRepository.findById(currentUserId).orElseThrow(() -> new IllegalStateException("Authenticated user not found"));

        FamilyNetwork network = new FamilyNetwork();
        network.setName(request.name());
        network.setInviteCode(generateUniqueInviteCode());
        network.setCreatedBy(currentUser);

        FamilyNetwork savedNetwork = familyNetworkRepository.save(network);

        NetworkMember membership = new NetworkMember();
        membership.setNetwork(savedNetwork);
        membership.setUser(currentUser);
        networkMemberRepository.save(membership);

        // Currently, i haven't set it up so that if something happens to the app between saving the family network and the network creater, we can get a network without a creater, which is not ideal. need to fix

        return toResponse(savedNetwork);

    }

    public NetworkResponse joinNetwork(JoinNetworkRequest request) {

        Long currentUserId = currentUserProvider.getCurrentUserId();
        User currentUser = userRepository.findById(currentUserId).orElseThrow(() -> new IllegalStateException("Authenticated user not found"));

        FamilyNetwork network = familyNetworkRepository.findByInviteCode(request.inviteCode()).orElseThrow(() -> new IllegalArgumentException("Invalid invite code"));

        if (networkMemberRepository.existsByNetworkIdAndUserId(network.getId(), currentUserId)) {
            throw new IllegalArgumentException("Already a member of this network");
        }

        NetworkMember membership = new NetworkMember();
        membership.setNetwork(network);
        membership.setUser(currentUser);
        networkMemberRepository.save(membership);

        return toResponse(network);

    }

    public List<NetworkResponse> getMyNetworks() {
        Long currentUserId = currentUserProvider.getCurrentUserId();

        return networkMemberRepository.findByUserId(currentUserId).stream()
                .map(member -> toResponse(member.getNetwork()))
                .toList();
    }

    public NetworkResponse getNetworkById(Long networkId) {
        Long currentUserId = currentUserProvider.getCurrentUserId();

        if (!networkMemberRepository.existsByNetworkIdAndUserId(networkId, currentUserId)) {
            throw new SecurityException("Not a member of this network");
        }

        FamilyNetwork network = familyNetworkRepository.findById(networkId).orElseThrow(() -> new IllegalArgumentException("Network not found"));

        return toResponse(network);

    }

    public List<MemberResponse> getNetworkMembers(Long networkId) {

        Long currentUserId = currentUserProvider.getCurrentUserId();

        if (!networkMemberRepository.existsByNetworkIdAndUserId(networkId, currentUserId)) {
            throw new SecurityException("Not a member of this network");
        }

        return networkMemberRepository.findByNetworkId(networkId).stream()
                .map(member -> new MemberResponse(member.getUser().getId(), member.getUser().getName()))
                .toList();

    }

    private String generateUniqueInviteCode() {

        String code;

        do {
            code = generateRandomCode();
        } while (familyNetworkRepository.existsByInviteCode(code));

        return code;

    }

    private String generateRandomCode() {
        StringBuilder builder = new StringBuilder(CODE_LENGTH);

        for (int i = 0; i < CODE_LENGTH; i++) {
            int index = RANDOM.nextInt(CODE_CHARACTERS.length());
            builder.append(CODE_CHARACTERS.charAt(index));
        }

        return builder.toString();
    }

    private NetworkResponse toResponse(FamilyNetwork network) {
        return new NetworkResponse(
            network.getId(),
            network.getName(),
            network.getInviteCode(),
            network.getCreatedBy().getId(),
            network.getCreatedAt()
        );


    }

}